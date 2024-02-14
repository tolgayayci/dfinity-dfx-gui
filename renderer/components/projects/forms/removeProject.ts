import * as z from "zod";

export const removeProjectFormSchema = z.object({
  project_name: z
    .string()
    .min(3, "Project name must be at least 3 characters long.")
    .max(50, "Project name must be at most 50 characters long."),
  path: z.string(),
});

export async function onRemoveProjectFormSubmit(
  data: z.infer<typeof removeProjectFormSchema>
) {
  try {
    const result = await window.awesomeApi.manageProjects("delete", {
      path: data.path,
    });

    return result;
  } catch (error) {
    throw error;
  }
}
