import PageMeta from "../../components/common/PageMeta";
//import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Iniciar Sesión"
        description="Esta es la página de inicio de sesión para Compras Energia PD"
      />
      {/* <AuthLayout> */}
        <SignInForm />
      {/* </AuthLayout> */}
    </>
  );
}
