import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { provideWalletAdapter } from '@heavy-duty/wallet-adapter';
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack';
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    provideAnimations(),
    provideWalletAdapter({
      adapters: [
        new BackpackWalletAdapter(),
        new PhantomWalletAdapter(),
        new GlowWalletAdapter(),
      ],
    }),
    importProvidersFrom([MatSnackBarModule, MatDialogModule]),
  ],
};
