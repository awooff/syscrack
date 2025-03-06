declare module NodeJS {
  export interface ProcessEnv {
    PORT: number;
    PUBLIC_URL: string;
    SESSION_SECRET: string;
    DATABASE_URL: string;
    CURRENT_GAME_ID: string;
    WEBSITE_TITLE: string;
    JWT_SECRET: string;
  }
}
