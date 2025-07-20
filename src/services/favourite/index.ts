import env from "@/config/env";
import instance from "@/lib/axios";

class FavouriteService {
  addToFavourite({ fileId }: { fileId: string }) {
    return instance.post(env.api.favourite + "/favorites", { fileId: fileId });
  }
  removeFromFavourite(fileId: string) {
    return instance.delete(env.api.favourite + "/favorites/" + fileId);
  }
  getFavourites(count = 3) {
    return instance.get(`${env.api.favourite}/favorites?count=${count}`);
  }
}

const favouriteService = new FavouriteService();
export default favouriteService;
