import AppLayout from "@/client/layout/layout";

const SignIn = () => {
  return <div>SignIn</div>;
};

SignIn.getLayout = function getLayout(page: React.ReactNode) {
  return <AppLayout>{page}</AppLayout>;
};

export default SignIn;
