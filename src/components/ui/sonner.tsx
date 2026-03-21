import { Toaster as Sonner, toast as sonnerToast } from "sonner";

// Wrapper that auto-dismisses after 1.5s regardless of hover/touch
const toast = {
  success: (msg: string) => {
    const id = sonnerToast.success(msg, { duration: 1500 });
    setTimeout(() => sonnerToast.dismiss(id), 1500);
    return id;
  },
  error: (msg: string) => {
    const id = sonnerToast.error(msg, { duration: 2500 });
    setTimeout(() => sonnerToast.dismiss(id), 2500);
    return id;
  },
  info: (msg: string) => {
    const id = sonnerToast.info(msg, { duration: 1500 });
    setTimeout(() => sonnerToast.dismiss(id), 1500);
    return id;
  },
  message: (msg: string) => {
    const id = sonnerToast(msg, { duration: 1500 });
    setTimeout(() => sonnerToast.dismiss(id), 1500);
    return id;
  },
  dismiss: sonnerToast.dismiss,
};

const Toaster = () => {
  return (
    <Sonner
      theme="light"
      position="bottom-center"
      duration={1500}
      visibleToasts={1}
      closeButton={false}
      style={{ zIndex: 99999 }}
      toastOptions={{
        style: {
          padding: "10px 16px",
          fontSize: "14px",
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
    />
  );
};

export { Toaster, toast };
