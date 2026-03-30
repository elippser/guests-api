import * as guestService from "../services/guestService";
import { Guest } from "../models/Guest";

jest.mock("../models/Guest");

describe("Guest Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getGuestById", () => {
    it("should return guest when found", async () => {
      const mockGuest = {
        guestId: "guest-uuid-123",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      };
      (Guest.findOne as jest.Mock).mockResolvedValue(mockGuest);

      const result = await guestService.getGuestById("guest-uuid-123");

      expect(Guest.findOne).toHaveBeenCalledWith({ guestId: "guest-uuid-123" });
      expect(result).toEqual(mockGuest);
    });

    it("should throw 404 when guest not found", async () => {
      (Guest.findOne as jest.Mock).mockResolvedValue(null);

      await expect(guestService.getGuestById("guest-not-found")).rejects.toMatchObject({
        message: "Huésped no encontrado",
        statusCode: 404,
      });
    });
  });

  describe("updateGuestProfile", () => {
    it("should update allowed fields", async () => {
      const mockGuest = {
        guestId: "guest-uuid-123",
        firstName: "John",
        lastName: "Doe",
        save: jest.fn().mockResolvedValue(true),
      };
      (Guest.findOne as jest.Mock).mockResolvedValue(mockGuest);

      await guestService.updateGuestProfile("guest-uuid-123", {
        firstName: "Jane",
        lastName: "Smith",
      });

      expect(mockGuest.firstName).toBe("Jane");
      expect(mockGuest.lastName).toBe("Smith");
      expect(mockGuest.save).toHaveBeenCalled();
    });
  });

  describe("changeGuestPassword", () => {
    it("should throw 401 when current password is wrong", async () => {
      const mockGuest = {
        guestId: "guest-uuid-123",
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      (Guest.findOne as jest.Mock).mockReturnValue({
        select: jest.fn().mockResolvedValue(mockGuest),
      });

      await expect(
        guestService.changeGuestPassword(
          "guest-uuid-123",
          "wrong",
          "NewPass1!abc"
        )
      ).rejects.toMatchObject({
        message: "Contraseña actual incorrecta",
        statusCode: 401,
      });
    });
  });

  describe("deleteGuestAccount", () => {
    it("should set status to deleted", async () => {
      const mockGuest = {
        guestId: "guest-uuid-123",
        status: "active",
        save: jest.fn().mockResolvedValue(true),
      };
      (Guest.findOne as jest.Mock).mockResolvedValue(mockGuest);

      await guestService.deleteGuestAccount("guest-uuid-123");

      expect(mockGuest.status).toBe("deleted");
      expect(mockGuest.save).toHaveBeenCalledWith({ validateBeforeSave: false });
    });
  });
});
