import * as authService from "../services/authService";
import { Guest } from "../models/Guest";

jest.mock("../models/Guest");

describe("Auth Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerGuestService", () => {
    it("should throw 400 when email already exists", async () => {
      (Guest.findOne as jest.Mock).mockResolvedValue({ email: "exists@test.com" });

      await expect(
        authService.registerGuestService({
          firstName: "John",
          lastName: "Doe",
          email: "exists@test.com",
          password: "Pass123!abc",
          phone: "1234567890",
          document: { type: "dni", number: "12345678" },
          nationality: "AR",
        })
      ).rejects.toMatchObject({
        message: "El email ya está registrado",
        statusCode: 400,
      });
    });
  });

  describe("loginGuestService", () => {
    it("should throw 401 when guest not found", async () => {
      (Guest.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await expect(
        authService.loginGuestService("notfound@test.com", "password")
      ).rejects.toMatchObject({
        message: "Credenciales inválidas",
        statusCode: 401,
      });
    });

    it("should throw 403 when guest status is not active", async () => {
      const mockGuest = {
        guestId: "guest-123",
        email: "suspended@test.com",
        status: "suspended",
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      (Guest.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockGuest),
      });

      await expect(
        authService.loginGuestService("suspended@test.com", "Pass123!abc")
      ).rejects.toMatchObject({
        message: "Cuenta no activa",
        statusCode: 403,
      });
    });
  });
});
