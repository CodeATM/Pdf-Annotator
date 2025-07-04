import env from "@/config/env";
import instance from "@/lib/axios";

class Service {
  uploadFile({ payload }: any) {
    return instance.post(env.api.file + "/upload-pdf", payload);
  }
  getSinglePdf({ fileId }: { fileId: string }) {
    return instance.get(env.api.file + "/" + fileId);
  }
}

const FileService = new Service();
export default FileService;
