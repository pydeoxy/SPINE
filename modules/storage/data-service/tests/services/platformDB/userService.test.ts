import {
  UserService,
  CreateUserData,
  UpdateUserData,
} from "../../../src/services/platformDB/userService";
import { UserRole } from "../../../generated/platform";

describe("UserService", () => {
  describe("createUser", () => {
    it("should create a new user with required fields", async () => {
      const userData: CreateUserData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const user = await UserService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.name).toBe(userData.name);
      expect(user.role).toBe(UserRole.USER);
      expect(user.id).toBeDefined();
      expect(user.createdAt).toBeDefined();
      expect(user.updatedAt).toBeDefined();
      // Password should not be returned
      expect(user).not.toHaveProperty("password");
    });

    it("should create a user with specified role", async () => {
      const userData: CreateUserData = {
        email: "admin@example.com",
        password: "password123",
        name: "Admin User",
        role: UserRole.ADMIN,
      };

      const user = await UserService.createUser(userData);

      expect(user.role).toBe(UserRole.ADMIN);
    });

    it("should throw validation error for missing email", async () => {
      const userData: CreateUserData = {
        email: "",
        password: "password123",
        name: "Test User",
      };

      await expect(UserService.createUser(userData)).rejects.toThrow(
        "Email is required"
      );
    });

    it("should throw validation error for missing password", async () => {
      const userData: CreateUserData = {
        email: "test@example.com",
        password: "",
        name: "Test User",
      };

      await expect(UserService.createUser(userData)).rejects.toThrow(
        "Password is required"
      );
    });

    it("should throw conflict error for duplicate email", async () => {
      const userData: CreateUserData = {
        email: "duplicate@example.com",
        password: "password123",
        name: "First User",
      };

      await UserService.createUser(userData);

      const duplicateUserData: CreateUserData = {
        email: "duplicate@example.com",
        password: "password456",
        name: "Second User",
      };

      await expect(UserService.createUser(duplicateUserData)).rejects.toThrow(
        "User with this email already exists"
      );
    });
  });

  describe("getAllUsers", () => {
    it("should return empty array when no users exist", async () => {
      const users = await UserService.getAllUsers();
      expect(users).toEqual([]);
    });

    it("should return all users without passwords", async () => {
      const userData1: CreateUserData = {
        email: "user1@example.com",
        password: "password123",
        name: "User One",
      };

      const userData2: CreateUserData = {
        email: "user2@example.com",
        password: "password456",
        name: "User Two",
      };

      await UserService.createUser(userData1);
      await UserService.createUser(userData2);

      const users = await UserService.getAllUsers();

      expect(users).toHaveLength(2);
      expect(users[0]).not.toHaveProperty("password");
      expect(users[1]).not.toHaveProperty("password");
    });
  });

  describe("getUserById", () => {
    it("should return user by valid id", async () => {
      const userData: CreateUserData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const createdUser = await UserService.createUser(userData);
      const foundUser = await UserService.getUserById(createdUser.id);

      expect(foundUser).toBeDefined();
      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.email).toBe(userData.email);
      expect(foundUser).not.toHaveProperty("password");
      expect(foundUser.projectMemberships).toBeDefined();
    });

    it("should throw validation error for empty id", async () => {
      await expect(UserService.getUserById("")).rejects.toThrow(
        "User ID is required"
      );
    });

    it("should throw not found error for non-existent id", async () => {
      const nonExistentId = "clxxx0000000000000000000";
      await expect(UserService.getUserById(nonExistentId)).rejects.toThrow(
        `User with ID ${nonExistentId} not found`
      );
    });
  });

  describe("getUserByEmail", () => {
    it("should return user by valid email", async () => {
      const userData: CreateUserData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      await UserService.createUser(userData);
      const foundUser = await UserService.getUserByEmail(userData.email);

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(userData.email);
      expect(foundUser).not.toHaveProperty("password");
    });

    it("should throw validation error for empty email", async () => {
      await expect(UserService.getUserByEmail("")).rejects.toThrow(
        "Email is required"
      );
    });

    it("should throw not found error for non-existent email", async () => {
      const nonExistentEmail = "nonexistent@example.com";
      await expect(
        UserService.getUserByEmail(nonExistentEmail)
      ).rejects.toThrow(`User with ID ${nonExistentEmail} not found`);
    });
  });

  describe("getUserByEmailWithPassword", () => {
    it("should return user with password for authentication", async () => {
      const userData: CreateUserData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      await UserService.createUser(userData);
      const foundUser = await UserService.getUserByEmailWithPassword(
        userData.email
      );

      expect(foundUser).toBeDefined();
      expect(foundUser.email).toBe(userData.email);
      expect(foundUser.password).toBe(userData.password);
      expect(foundUser.role).toBeDefined();
    });

    it("should throw validation error for empty email", async () => {
      await expect(UserService.getUserByEmailWithPassword("")).rejects.toThrow(
        "Email is required"
      );
    });

    it("should throw not found error for non-existent email", async () => {
      const nonExistentEmail = "nonexistent@example.com";
      await expect(
        UserService.getUserByEmailWithPassword(nonExistentEmail)
      ).rejects.toThrow(`User with ID ${nonExistentEmail} not found`);
    });
  });

  describe("updateUser", () => {
    it("should update user fields", async () => {
      const userData: CreateUserData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const createdUser = await UserService.createUser(userData);

      const updateData: UpdateUserData = {
        name: "Updated User",
        role: UserRole.ADMIN,
      };

      const updatedUser = await UserService.updateUser(
        createdUser.id,
        updateData
      );

      expect(updatedUser.name).toBe(updateData.name);
      expect(updatedUser.role).toBe(updateData.role);
      expect(updatedUser.email).toBe(userData.email); // unchanged
    });

    it("should update user email if not taken", async () => {
      const userData: CreateUserData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const createdUser = await UserService.createUser(userData);

      const updateData: UpdateUserData = {
        email: "newemail@example.com",
      };

      const updatedUser = await UserService.updateUser(
        createdUser.id,
        updateData
      );

      expect(updatedUser.email).toBe(updateData.email);
    });

    it("should throw validation error for empty id", async () => {
      await expect(UserService.updateUser("", {})).rejects.toThrow(
        "User ID is required"
      );
    });

    it("should throw not found error for non-existent user", async () => {
      const nonExistentId = "clxxx0000000000000000000";
      await expect(
        UserService.updateUser(nonExistentId, { name: "Test" })
      ).rejects.toThrow(`User with ID ${nonExistentId} not found`);
    });

    it("should throw conflict error when updating to existing email", async () => {
      const user1Data: CreateUserData = {
        email: "user1@example.com",
        password: "password123",
        name: "User One",
      };

      const user2Data: CreateUserData = {
        email: "user2@example.com",
        password: "password456",
        name: "User Two",
      };

      await UserService.createUser(user1Data);
      const user2 = await UserService.createUser(user2Data);

      await expect(
        UserService.updateUser(user2.id, { email: "user1@example.com" })
      ).rejects.toThrow("Email already taken by another user");
    });
  });

  describe("deleteUser", () => {
    it("should delete existing user", async () => {
      const userData: CreateUserData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const createdUser = await UserService.createUser(userData);
      await UserService.deleteUser(createdUser.id);

      await expect(UserService.getUserById(createdUser.id)).rejects.toThrow(
        "not found"
      );
    });

    it("should throw validation error for empty id", async () => {
      await expect(UserService.deleteUser("")).rejects.toThrow(
        "User ID is required"
      );
    });

    it("should throw not found error for non-existent user", async () => {
      const nonExistentId = "clxxx0000000000000000000";
      await expect(UserService.deleteUser(nonExistentId)).rejects.toThrow(
        `User with ID ${nonExistentId} not found`
      );
    });
  });

  describe("userExists", () => {
    it("should return true for existing user email", async () => {
      const userData: CreateUserData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      await UserService.createUser(userData);
      const exists = await UserService.userExists(userData.email);

      expect(exists).toBe(true);
    });

    it("should return false for non-existent user email", async () => {
      const exists = await UserService.userExists("nonexistent@example.com");
      expect(exists).toBe(false);
    });
  });

  describe("getUserByEmailSafe", () => {
    it("should return user if exists", async () => {
      const userData: CreateUserData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      await UserService.createUser(userData);
      const user = await UserService.getUserByEmailSafe(userData.email);

      expect(user).toBeDefined();
      expect(user?.email).toBe(userData.email);
    });

    it("should return null for non-existent user", async () => {
      const user = await UserService.getUserByEmailSafe(
        "nonexistent@example.com"
      );
      expect(user).toBeNull();
    });
  });

  describe("getUserProjectMemberships", () => {
    it("should return empty array for user with no memberships", async () => {
      const userData: CreateUserData = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const user = await UserService.createUser(userData);
      const memberships = await UserService.getUserProjectMemberships(user.id);

      expect(memberships).toEqual([]);
    });

    it("should throw not found error for non-existent user", async () => {
      const nonExistentId = "clxxx0000000000000000000";
      await expect(
        UserService.getUserProjectMemberships(nonExistentId)
      ).rejects.toThrow(`User with ID ${nonExistentId} not found`);
    });
  });
});
