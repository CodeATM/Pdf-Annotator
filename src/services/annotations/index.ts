import env from "@/config/env";
import instance from "@/lib/axios";
import { ApiAnnotation } from "@/lib/types";

export interface SaveAnnotationRequest {
  annotations: ApiAnnotation[];
}

export interface SaveAnnotationResponse {
  success: boolean;
  message: string;
  data?: any;
}

class AnnotationService {
  createAnnotation({ payload }: { payload: SaveAnnotationRequest }) {
    return instance.post(env.api.annotation + "/create-annotation", payload);
  }
}

const AnnotationServiceInstance = new AnnotationService();
export default AnnotationServiceInstance; 