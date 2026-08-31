import * as z from "zod";

const loginSchema = z.object({
  username: z.email().min(1, {
    error: "Please enter a valid username",
  }),
  password: z.string().min(3, {
    error: "Please enter a vlaid password",
  }),
});

type LoginForm = z.infer<typeof loginSchema>;

export { LoginForm, loginSchema };

