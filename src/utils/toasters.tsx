import { toast } from 'sonner';

export const showSuccessToast = ({
   message,
   description,
   position = 'bottom-right',
   duration = 3000,
   closeButton = false,
}: {
   message?: string;
   duration?: number;
   description?: string;
   position?: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';
   closeButton?: boolean;
}) => {
   return toast(`${message}`, {
      position,
      description,
      duration,
      closeButton,
   });
};

export const showErrorToast = ({
   message,
   description,
   position = 'top-right',
   duration = 3000,
   closeButton = true,
}: {
   message?: string;
   duration?: number;
   description?: string;
   position?: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';
   closeButton?: boolean;
}) => {
   return toast.error(`${message}`, {
      position,
      description,
      duration,
      closeButton,
   });
};

export const showInfoToast = ({
   message,
   description,
   position = 'top-right',
   duration = 3000,
   closeButton = true,
}: {
   message?: string;
   duration?: number;
   description?: string;
   position?: 'bottom-center' | 'bottom-left' | 'bottom-right' | 'top-center' | 'top-left' | 'top-right';
   closeButton?: boolean;
}) => {
   return toast.info(`${message}`, {
      position,
      description,
      duration,
      closeButton,
   });
};