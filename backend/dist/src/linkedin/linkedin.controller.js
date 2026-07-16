"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkedInController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let LinkedInController = class LinkedInController {
    config;
    constructor(config) {
        this.config = config;
    }
    auth(res) {
        const clientId = this.config.get('LINKEDIN_CLIENT_ID');
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
    async callback(code, error, res) {
        if (error || !code) {
            return res.send(this.postAndClose({ type: 'linkedin-error', error: error ?? 'Access denied' }));
        }
        try {
            const clientId = this.config.get('LINKEDIN_CLIENT_ID');
            const clientSecret = this.config.get('LINKEDIN_CLIENT_SECRET');
            const redirectUri = this.config.get('LINKEDIN_REDIRECT_URI', 'http://localhost:3000/api/linkedin/callback');
            const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'authorization_code',
                    code,
                    client_id: clientId,
                    client_secret: clientSecret,
                    redirect_uri: redirectUri,
                }),
            });
            const tokenData = await tokenRes.json();
            if (!tokenData.access_token)
                throw new Error('No access token received');
            const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
                headers: { Authorization: `Bearer ${tokenData.access_token}` },
            });
            const profile = await profileRes.json();
            return res.send(this.postAndClose({ type: 'linkedin-profile', profile }));
        }
        catch {
            return res.send(this.postAndClose({ type: 'linkedin-error', error: 'Failed to fetch LinkedIn profile' }));
        }
    }
    postAndClose(data) {
        return this.html(`<script>
      try { window.opener.postMessage(${JSON.stringify(data)}, '*'); } catch(e) {}
      window.close();
    </script>`);
    }
    html(body) {
        return `<!DOCTYPE html><html><body>${body}</body></html>`;
    }
};
exports.LinkedInController = LinkedInController;
__decorate([
    (0, common_1.Get)('auth'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], LinkedInController.prototype, "auth", null);
__decorate([
    (0, common_1.Get)('callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Query)('error')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], LinkedInController.prototype, "callback", null);
exports.LinkedInController = LinkedInController = __decorate([
    (0, common_1.Controller)('linkedin'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], LinkedInController);
//# sourceMappingURL=linkedin.controller.js.map