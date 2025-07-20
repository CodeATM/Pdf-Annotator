import env from "@/config/env";
import instance from "@/lib/axios";

export interface SaveAnnotationResponse {
  success: boolean;
  message: string;
  data?: any;
}

class Service {
  requestAccess({ fileId }: { fileId: string }) {
    return instance.post(env.api.file + "/request/" + fileId);
  }
  
  getAllRequests({ fileId }: { fileId: string }) {
    return instance.get(env.api.file + "/file-requests/" + fileId);
  }
  
  approveRequest({ fileId, payload }: { fileId: string; payload: { userId: string; role: string } }) {
    return instance.post(env.api.file + "/accept/" + fileId + "/collaborators", payload);
  }
  
  denyRequest({ fileId, userId }: { fileId: string; userId: string }) {
    return instance.patch(env.api.file + "/" + fileId + "/collaborators/deny", { userId });
  }
  
  deleteRequest({ fileId, userId }: { fileId: string; userId: string }) {
    return instance.delete(env.api.file + "/" + fileId + "/collaborators/" + userId);
  }
}

const AccessService = new Service();
export default AccessService;
