declare namespace Express {
  interface Request {
    guest?: {
      guestId: string;
      email: string;
    };
  }
}
