import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import router from "./router";
import { useUserStore } from "./stores/user-store";

function App() {
  const { fetchLoginUser } = useUserStore();

  useEffect(() => {
    fetchLoginUser();
  }, [fetchLoginUser]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
    </>
  );
}

export default App;
