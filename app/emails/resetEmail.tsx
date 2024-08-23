import { Button, Html, Tailwind, Body } from "@react-email/components";

export default function ResetEmail({ link }) {
  return (
    <Html>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: "orange",
              },
            },
          },
        }}
      >
        <div className="max-w-lg items-center bg-orange-200 m-auto p-4">
          <h1 className="text-center text-2xl font-bold">Film Friends</h1>
          <p className="text-lg mt-4 text-center">
            We all forget our passwords sometimes. Click the button below to
            reset your password.
          </p>
          <div className="w-100 grid justify-center">
            <Button
              href={link}
              className="bg-brand px-3 py-2 font-medium leading-4 text-white"
            >
              RESET PASSWORD
            </Button>
          </div>
        </div>
      </Tailwind>
    </Html>
  );
}
