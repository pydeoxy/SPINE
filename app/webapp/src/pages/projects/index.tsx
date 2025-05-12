import AppLayout from "@/client/layout/layout";

function Projects() {
  return (
    <div>
      <h1>Projects</h1>
    </div>
  );
}

Projects.getLayout = function getLayout(page: React.ReactNode) {
  return <AppLayout>{page}</AppLayout>;
};

export default Projects;
