import * as z from "zod";

export const addExistingProjectFormSchema = z.object({
  project_name: z
    .string()
    .min(3, {
      message: "Project name must be at least 3 characters long",
    })
    .max(255),
  path: z
    .string()
    .min(3, {
      message: "You must select a path",
    })
    .max(255),
});

export async function onAddExistingProjectForm(
  data: z.infer<typeof addExistingProjectFormSchema>
) {
  try {
    //check if it is a dfx project
    const result = await window.awesomeApi
      .isDfxProject(data.path)
      .then(async () => {
        await window.awesomeApi.manageProjects("add", {
          name: data.project_name,
          path: data.path,
        });
      });

    return result;
  } catch (error) {
    throw error; // Rethrow error to be handled by the caller
  }
}
