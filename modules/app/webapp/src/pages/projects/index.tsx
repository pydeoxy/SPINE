import { Button } from "@/client/components/basics/Button";
import AppLayout from "@/client/layout/layout";
import { withAuthSSR } from "@/server/auth/authenticated-ssr";

function Projects() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-foreground mb-6">Projects</h1>
      <div className="text-center">
        <Button variant="primary" href="/projects/0">
          Flink pipeline example
        </Button>
      </div>
    </div>
  );
}

Projects.getLayout = function getLayout(page: React.ReactNode) {
  return <AppLayout>{page}</AppLayout>;
};

export default Projects;

export const getServerSideProps = withAuthSSR({
  handler: async (ctx) => {
    return {
      props: {
        user: ctx.req.session.data,
      },
    };
  },
});
