import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller('linkedin')
export class LinkedInController {
  constructor(private readonly config: ConfigService) {}

  @Get('auth')
  auth(@Res() res: Response) {
    const clientId = this.config.get<string>('LINKEDIN_CLIENT_ID');
    if (!clientId) {
      return res.send(this.html(`
        <h2 style="font-family:sans-serif;text-align:center;margin-top:80px;color:#555">
          LinkedIn not configured.<br>
          <small style="font-size:14px">Set LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET in your .env</small>
        </h2>
      `));
    }
    const redirectUri = this.config.get('LINKEDIN_REDIRECT_URI', 'http://localhost:3000/api/linkedin/callback');
    const state = Math.random().toString(36).slice(2);
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'openid profile email',
      state,
    });
    return res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`);
  }

  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error || !code) {
      return res.send(this.postAndClose({ type: 'linkedin-error', error: error ?? 'Access denied' }));
    }

    try {
      const clientId     = this.config.get<string>('LINKEDIN_CLIENT_ID')!;
      const clientSecret = this.config.get<string>('LINKEDIN_CLIENT_SECRET')!;
      const redirectUri  = this.config.get('LINKEDIN_REDIRECT_URI', 'http://localhost:3000/api/linkedin/callback');

      const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type:    'authorization_code',
          code,
          client_id:     clientId,
          client_secret: clientSecret,
          redirect_uri:  redirectUri,
        }),
      });

      const tokenData = await tokenRes.json() as { access_token?: string };
      if (!tokenData.access_token) throw new Error('No access token received');

      const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });
      const profile = await profileRes.json();

      return res.send(this.postAndClose({ type: 'linkedin-profile', profile }));
    } catch {
      return res.send(this.postAndClose({ type: 'linkedin-error', error: 'Failed to fetch LinkedIn profile' }));
    }
  }

  private postAndClose(data: object): string {
    return this.html(`<script>
      try { window.opener.postMessage(${JSON.stringify(data)}, '*'); } catch(e) {}
      window.close();
    </script>`);
  }

  private html(body: string): string {
    return `<!DOCTYPE html><html><body>${body}</body></html>`;
  }
}
