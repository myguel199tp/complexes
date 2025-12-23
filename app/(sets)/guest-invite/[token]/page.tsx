"use client";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useGuestInvite } from "../../host/_components/guestInvitequeries";
import { guestInviteSchema } from "../../host/_components/useExternalStayForm";
import { confirmGuestInvite } from "../services/guestInviteservice";

export default function GuestInvitePage({ params }) {
  const { data } = useGuestInvite(params.token);
  console.log(data);
  const form = useForm({
    resolver: yupResolver(guestInviteSchema),
  });

  const onSubmit = form.handleSubmit((data) => {
    confirmGuestInvite(params.token, data);
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...form.register("fullName")} />
      <input {...form.register("document")} />
      <input {...form.register("phone")} />
      <label>
        <input type="checkbox" {...form.register("acceptRules")} /> Acepto
        reglas
      </label>

      <button type="submit">Confirmar acceso</button>
    </form>
  );
}
