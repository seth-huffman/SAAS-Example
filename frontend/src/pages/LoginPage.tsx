import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Mail, Lock, LogIn } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../store/auth.store';

const schema = z.object({
  email:    z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

// Target center of the topbar brand (35px left-padding + ~90px half-width of 2rem text, 50px = center of 100px topbar)
const TOPBAR_BRAND_X = 125;
const TOPBAR_BRAND_Y = 50;

export function LoginPage() {
  const navigate    = useNavigate();
  const { setAuth } = useAuthStore();
  const brandRef    = useRef<HTMLDivElement>(null);

  const [isOut,       setIsOut]       = useState(false);
  const [brandStyle,  setBrandStyle]  = useState<React.CSSProperties>({});

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: ({ email, password }: FormData) => authApi.login(email, password),

    onSuccess: async (tokens) => {
      localStorage.setItem('hr-refresh-token', tokens.refreshToken);
      // Use the freshly-issued access token when calling /auth/me to avoid a 401
      const axiosApi = await import('../api/axios').then((m) => m.default);
      const meRes = await axiosApi.get('/auth/me', { headers: { Authorization: `Bearer ${tokens.accessToken}` } });
      const me = meRes.data.data;
      setAuth({ userId: me.id, email: me.email, role: me.role }, tokens.accessToken);

      // Measure the brand element's current center in the viewport
      if (brandRef.current) {
        const rect = brandRef.current.getBoundingClientRect();
        const cx = rect.left + rect.width  / 2;
        const cy = rect.top  + rect.height / 2;

        // translate(cx→targetX, cy→targetY) then scale to half (4rem→2rem)
        const tx = TOPBAR_BRAND_X - cx;
        const ty = TOPBAR_BRAND_Y - cy;

        setBrandStyle({
          transform:       `translate(${tx}px, ${ty}px) scale(0.5)`,
          transition:      'transform 650ms cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'center center',
        });
      }

      // Trigger footer + form-body CSS transitions
      setIsOut(true);

      // Navigate once the animation finishes
      setTimeout(() => navigate('/time-off'), 700);
    },

    onError: () => { toast.error('Invalid email or password'); },
  });

  return (
    <div className="login-page">

      <div className="login-card">
        {/* Brand — animated to the topbar on login */}
        <div className="login-card__brand" ref={brandRef} style={brandStyle}>
          <p className="login-card__brand-name">
            <span>shift</span><span>control</span>
          </p>
          <p className="login-card__brand-sub">Employee Resources</p>
        </div>

        {/* Form body — fades out on login */}
        <div className={`login-card__body${isOut ? ' login-card__body--out' : ''}`}>
          <form onSubmit={handleSubmit((data) => mutate(data))} className="form">
            <div className="field">
              <div className="login-input-wrap">
                <Mail className="login-input-icon" size={18} />
                <Input id="email" type="email" placeholder="email" {...register('email')} />
              </div>
              {errors.email && <p className="field__error">{errors.email.message}</p>}
            </div>
            <div className="field">
              <div className="login-input-wrap">
                <Lock className="login-input-icon" size={18} />
                <Input id="password" type="password" placeholder="password" {...register('password')} />
              </div>
              {errors.password && <p className="field__error">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="btn--full" disabled={isPending}>
              <LogIn size={18} />
              {isPending ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

        </div>
      </div>

      {/* White footer strip — expands upward on login */}
      <div className={`login-footer${isOut ? ' login-footer--out' : ''}`}>
        <div className="login-demo">
          <p className="login-demo__label">Demo credentials</p>
          <p className="login-demo__row"><span>email</span><span>seth@shiftcontrol.io</span></p>
          <p className="login-demo__row"><span>password</span><span>Admin123!</span></p>
        </div>
      </div>

    </div>
  );
}
