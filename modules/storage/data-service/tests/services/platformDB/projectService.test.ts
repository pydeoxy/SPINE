import {
  ProjectService,
  CreateProjectData,
  UpdateProjectData,
  AddProjectMemberData,
} from "../../../src/services/platformDB/projectService";
import {
  UserService,
  CreateUserData,
} from "../../../src/services/platformDB/userService";
import { MemberRole } from "../../../generated/platform";

describe("ProjectService", () => {
  let testUser: any;

  beforeEach(async () => {
    // Create a test user for project operations
    const userData: CreateUserData = {
      email: "testuser@example.com",
      password: "password123",
      name: "Test User",
    };
    testUser = await UserService.createUser(userData);
  });

  describe("createProject", () => {
    it("should create a project with basic information", async () => {
      const projectData: CreateProjectData = {
        name: "Test Project",
        description: "A test project for IoT sensors",
      };

      const project = await ProjectService.createProject(projectData);

      expect(project).toBeDefined();
      expect(project.name).toBe(projectData.name);
      expect(project.description).toBe(projectData.description);
      expect(project.id).toBeDefined();
      expect(project.createdAt).toBeDefined();
      expect(project.updatedAt).toBeDefined();
    });

    it("should create a project with initial members", async () => {
      const projectData: CreateProjectData = {
        name: "Test Project",
        description: "A test project",
        members: [
          {
            userId: testUser.id,
            role: MemberRole.OWNER,
          },
        ],
      };

      const project = await ProjectService.createProject(projectData);

      expect(project.members).toHaveLength(1);
      expect(project.members[0].userId).toBe(testUser.id);
      expect(project.members[0].role).toBe(MemberRole.OWNER);
      expect(project.members[0].user.email).toBe(testUser.email);
    });

    it("should create a project without description", async () => {
      const projectData: CreateProjectData = {
        name: "Test Project",
      };

      const project = await ProjectService.createProject(projectData);

      expect(project.name).toBe(projectData.name);
      expect(project.description).toBeNull();
    });
  });

  describe("getAllProjects", () => {
    it("should return empty array when no projects exist", async () => {
      const projects = await ProjectService.getAllProjects();
      expect(projects).toEqual([]);
    });

    it("should return all projects with members and pipelines", async () => {
      const project1Data: CreateProjectData = {
        name: "Project One",
        description: "First project",
      };

      const project2Data: CreateProjectData = {
        name: "Project Two",
        description: "Second project",
      };

      await ProjectService.createProject(project1Data);
      await ProjectService.createProject(project2Data);

      const projects = await ProjectService.getAllProjects();

      expect(projects).toHaveLength(2);
      expect(projects[0].members).toBeDefined();
      expect(projects[0].pipelines).toBeDefined();
      expect(projects[1].members).toBeDefined();
      expect(projects[1].pipelines).toBeDefined();
    });
  });

  describe("getProjectById", () => {
    it("should return project by valid id", async () => {
      const projectData: CreateProjectData = {
        name: "Test Project",
        description: "A test project",
      };

      const createdProject = await ProjectService.createProject(projectData);
      const foundProject = await ProjectService.getProjectById(
        createdProject.id
      );

      expect(foundProject).toBeDefined();
      expect(foundProject.id).toBe(createdProject.id);
      expect(foundProject.name).toBe(projectData.name);
      expect(foundProject.members).toBeDefined();
      expect(foundProject.pipelines).toBeDefined();
    });

    it("should throw not found error for non-existent id", async () => {
      const nonExistentId = "clxxx0000000000000000000";
      await expect(
        ProjectService.getProjectById(nonExistentId)
      ).rejects.toThrow(`Project with ID ${nonExistentId} not found`);
    });
  });

  describe("getProjectsByUserId", () => {
    it("should return empty array for user with no project memberships", async () => {
      const projects = await ProjectService.getProjectsByUserId(testUser.id);
      expect(projects).toEqual([]);
    });

    it("should return projects where user is a member", async () => {
      const projectData: CreateProjectData = {
        name: "User Project",
        description: "Project with user as member",
        members: [
          {
            userId: testUser.id,
            role: MemberRole.EDITOR,
          },
        ],
      };

      await ProjectService.createProject(projectData);

      const projects = await ProjectService.getProjectsByUserId(testUser.id);

      expect(projects).toHaveLength(1);
      expect(projects[0].name).toBe(projectData.name);
      expect(projects[0].members.some((m) => m.userId === testUser.id)).toBe(
        true
      );
    });
  });

  describe("updateProject", () => {
    it("should update project name and description", async () => {
      const projectData: CreateProjectData = {
        name: "Original Project",
        description: "Original description",
      };

      const createdProject = await ProjectService.createProject(projectData);

      const updateData: UpdateProjectData = {
        name: "Updated Project",
        description: "Updated description",
      };

      const updatedProject = await ProjectService.updateProject(
        createdProject.id,
        updateData
      );

      expect(updatedProject.name).toBe(updateData.name);
      expect(updatedProject.description).toBe(updateData.description);
      expect(updatedProject.id).toBe(createdProject.id);
    });

    it("should throw not found error for non-existent project", async () => {
      const nonExistentId = "clxxx0000000000000000000";
      await expect(
        ProjectService.updateProject(nonExistentId, { name: "Test" })
      ).rejects.toThrow(`Project with ID ${nonExistentId} not found`);
    });
  });

  describe("deleteProject", () => {
    it("should delete existing project", async () => {
      const projectData: CreateProjectData = {
        name: "Project to Delete",
        description: "This project will be deleted",
      };

      const createdProject = await ProjectService.createProject(projectData);
      await ProjectService.deleteProject(createdProject.id);

      await expect(
        ProjectService.getProjectById(createdProject.id)
      ).rejects.toThrow("not found");
    });

    it("should throw not found error for non-existent project", async () => {
      const nonExistentId = "clxxx0000000000000000000";
      await expect(ProjectService.deleteProject(nonExistentId)).rejects.toThrow(
        `Project with ID ${nonExistentId} not found`
      );
    });
  });

  describe("Project Member Management", () => {
    let testProject: any;

    beforeEach(async () => {
      const projectData: CreateProjectData = {
        name: "Member Test Project",
        description: "Project for testing member operations",
      };
      testProject = await ProjectService.createProject(projectData);
    });

    describe("addProjectMember", () => {
      it("should add a member to the project", async () => {
        const memberData: AddProjectMemberData = {
          userId: testUser.id,
          role: MemberRole.EDITOR,
        };

        const member = await ProjectService.addProjectMember(
          testProject.id,
          memberData
        );

        expect(member.userId).toBe(testUser.id);
        expect(member.projectId).toBe(testProject.id);
        expect(member.role).toBe(MemberRole.EDITOR);
        expect(member.user.email).toBe(testUser.email);
      });

      it("should throw not found error for non-existent project", async () => {
        const memberData: AddProjectMemberData = {
          userId: testUser.id,
          role: MemberRole.VIEWER,
        };

        const nonExistentId = "clxxx0000000000000000000";
        await expect(
          ProjectService.addProjectMember(nonExistentId, memberData)
        ).rejects.toThrow(`Project with ID ${nonExistentId} not found`);
      });
    });

    describe("getProjectMembers", () => {
      it("should return empty array for project with no members", async () => {
        const members = await ProjectService.getProjectMembers(testProject.id);
        expect(members).toEqual([]);
      });

      it("should return all project members", async () => {
        const memberData: AddProjectMemberData = {
          userId: testUser.id,
          role: MemberRole.OWNER,
        };

        await ProjectService.addProjectMember(testProject.id, memberData);

        const members = await ProjectService.getProjectMembers(testProject.id);

        expect(members).toHaveLength(1);
        expect(members[0].userId).toBe(testUser.id);
        expect(members[0].user.email).toBe(testUser.email);
      });
    });

    describe("updateProjectMemberRole", () => {
      beforeEach(async () => {
        const memberData: AddProjectMemberData = {
          userId: testUser.id,
          role: MemberRole.VIEWER,
        };
        await ProjectService.addProjectMember(testProject.id, memberData);
      });

      it("should update member role", async () => {
        const updatedMember = await ProjectService.updateProjectMemberRole(
          testProject.id,
          testUser.id,
          MemberRole.EDITOR
        );

        expect(updatedMember.role).toBe(MemberRole.EDITOR);
        expect(updatedMember.userId).toBe(testUser.id);
        expect(updatedMember.projectId).toBe(testProject.id);
      });

      it("should throw not found error for non-existent project", async () => {
        const nonExistentId = "clxxx0000000000000000000";
        await expect(
          ProjectService.updateProjectMemberRole(
            nonExistentId,
            testUser.id,
            MemberRole.OWNER
          )
        ).rejects.toThrow(`Project with ID ${nonExistentId} not found`);
      });

      it("should throw not found error for non-member user", async () => {
        const anotherUserData: CreateUserData = {
          email: "another@example.com",
          password: "password123",
          name: "Another User",
        };
        const anotherUser = await UserService.createUser(anotherUserData);

        await expect(
          ProjectService.updateProjectMemberRole(
            testProject.id,
            anotherUser.id,
            MemberRole.EDITOR
          )
        ).rejects.toThrow(
          `User with ID ${anotherUser.id} is not a member of project ${testProject.id}`
        );
      });
    });

    describe("removeProjectMember", () => {
      beforeEach(async () => {
        const memberData: AddProjectMemberData = {
          userId: testUser.id,
          role: MemberRole.EDITOR,
        };
        await ProjectService.addProjectMember(testProject.id, memberData);
      });

      it("should remove member from project", async () => {
        await ProjectService.removeProjectMember(testProject.id, testUser.id);

        const members = await ProjectService.getProjectMembers(testProject.id);
        expect(members).toHaveLength(0);
      });

      it("should throw not found error for non-existent project", async () => {
        const nonExistentId = "clxxx0000000000000000000";
        await expect(
          ProjectService.removeProjectMember(nonExistentId, testUser.id)
        ).rejects.toThrow(`Project with ID ${nonExistentId} not found`);
      });

      it("should throw not found error for non-member user", async () => {
        const anotherUserData: CreateUserData = {
          email: "another@example.com",
          password: "password123",
          name: "Another User",
        };
        const anotherUser = await UserService.createUser(anotherUserData);

        await expect(
          ProjectService.removeProjectMember(testProject.id, anotherUser.id)
        ).rejects.toThrow(
          `User with ID ${anotherUser.id} is not a member of project ${testProject.id}`
        );
      });
    });

    describe("isProjectMember", () => {
      it("should return true for project member", async () => {
        const memberData: AddProjectMemberData = {
          userId: testUser.id,
          role: MemberRole.VIEWER,
        };
        await ProjectService.addProjectMember(testProject.id, memberData);

        const isMember = await ProjectService.isProjectMember(
          testProject.id,
          testUser.id
        );
        expect(isMember).toBe(true);
      });

      it("should return false for non-member", async () => {
        const isMember = await ProjectService.isProjectMember(
          testProject.id,
          testUser.id
        );
        expect(isMember).toBe(false);
      });
    });

    describe("getUserRoleInProject", () => {
      it("should return user role in project", async () => {
        const memberData: AddProjectMemberData = {
          userId: testUser.id,
          role: MemberRole.OWNER,
        };
        await ProjectService.addProjectMember(testProject.id, memberData);

        const role = await ProjectService.getUserRoleInProject(
          testProject.id,
          testUser.id
        );
        expect(role).toBe(MemberRole.OWNER);
      });

      it("should return null for non-member", async () => {
        const role = await ProjectService.getUserRoleInProject(
          testProject.id,
          testUser.id
        );
        expect(role).toBeNull();
      });
    });
  });
});
