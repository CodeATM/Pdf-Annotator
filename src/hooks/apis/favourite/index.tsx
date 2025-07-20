import { useState, useEffect } from "react";
import favouriteService from "@/services/favourite";
import { toast } from "sonner";

export const useAddToFavourite = () => {
  const [loading, setLoading] = useState(false);

  const onAddFavourite = async ({ fileId, successCallback, errorCallback }: {
    fileId: string;
    successCallback?: () => void;
    errorCallback?: (error: any) => void;
  }) => {
    setLoading(true);
    try {
      await favouriteService.addToFavourite({ fileId });
      toast.success("Added to favourites");
      if (successCallback) successCallback();
    } catch (error: any) {
      toast.error("Failed to add to favourites");
      if (errorCallback) errorCallback(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, onAddFavourite };
};

export const useRemoveFromFavourite = () => {
  const [loading, setLoading] = useState(false);

  const onRemoveFavourite = async ({ fileId, successCallback, errorCallback }: {
    fileId: string;
    successCallback?: () => void;
    errorCallback?: (error: any) => void;
  }) => {
    setLoading(true);
    try {
      await favouriteService.removeFromFavourite(fileId);
      toast.success("Removed from favourites");
      if (successCallback) successCallback();
    } catch (error: any) {
      toast.error("Failed to remove from favourites");
      if (errorCallback) errorCallback(error);
    } finally {
      setLoading(false);
    }
  };

  return { loading, onRemoveFavourite };
};

export const useGetFavourites = (count = 3) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    async function fetchFavourites() {
      setLoading(true);
      setError(null);
      try {
        const res = await favouriteService.getFavourites(count);
        setData(res.data?.data || []);
      } catch (e: any) {
        setError(e);
        setData([]);
        toast.error("Failed to fetch favourites");
      } finally {
        setLoading(false);
      }
    }
    fetchFavourites();
  }, [count]);

  return { loading, data, error };
};
