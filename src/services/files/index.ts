import env from "@/config/env";
import instance from "@/lib/axios";

class Service {
  uploadFile({ payload }: any) {
    return instance.post(env.api.file + "/upload-pdf", payload);
  }
  getSinglePdf({ fileId }: { fileId: string }) {
    return instance.get(env.api.file + "/" + fileId);
  }

  getFiles() {
    return instance.get(env.api.file + "/files");
  }

  editFile({ fileId, payload }: { fileId: string; payload: { title: string; description: string } }) {
    return instance.patch(env.api.file + "/edit-file/" + fileId, payload);
  }
}

const FileService = new Service();
export default FileService;
