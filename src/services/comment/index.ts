import env from "@/config/env";
import instance from "@/lib/axios";

class Service {
  createComment({ payload, fileId}: { payload: any, fileId: string }) {
    return instance.post(env.api.comment + "/add-comment/" + fileId , payload);
  }

  createReply({ payload, fileId}: { payload: any, fileId: string }) {
    return instance.post(env.api.comment + "/add-comment/" + fileId , payload);
  }

  getCommentThread(commentId: string) {
    return instance.get(env.api.comment + "/get-thread/" + commentId);
  }
}

const CommentService = new Service();
export default CommentService;