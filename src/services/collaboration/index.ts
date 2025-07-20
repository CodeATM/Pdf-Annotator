import env from "@/config/env";
import instance from "@/lib/axios";

class Service {
  getCollaboratiors({ fileId }: { fileId: string }) {
    return instance.get(
      env.api.collaboration + "/" + fileId + "/collaborators"
    );
  }

  updateUserRole({ fileId, payload }: { fileId: string; payload: any }) {
    return instance.patch(
      env.api.collaboration + "/" + fileId + "/collaborators/role",
      payload
    );
  }

  removeCollaborator({ fileId, userId }: { fileId: string; userId: string }) {
    return instance.patch(
      env.api.collaboration + "/" + fileId + "/collaborators/remove",
      { userId }
    );
  }
}

const CollaborationService = new Service();
export default CollaborationService;
