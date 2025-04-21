"use client";
import { Button, InputField } from "complexes-next-components";
import React, { useState } from "react";

export default function Form() {
  const [form, setForm] = useState({
    title: "",
    content: "",
    createdBy: "",
    polls: [
      {
        question: "",
        options: [{ option: "" }],
      },
    ],
  });

  return (
    <form className="space-y-4">
      <InputField
        placeholder="Título"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <textarea
        className="bg-gray-200 w-full"
        placeholder="Contenido"
        value={form.content}
        onChange={(e) => setForm({ ...form, content: e.target.value })}
      />
      <InputField
        placeholder="Creado por"
        value={form.createdBy}
        onChange={(e) => setForm({ ...form, createdBy: e.target.value })}
      />

      {/* Map dynamically for polls */}
      {form.polls.map((poll, index) => (
        <div key={index}>
          <InputField
            placeholder="Pregunta de encuesta"
            value={poll.question}
            onChange={(e) => {
              const newPolls = [...form.polls];
              newPolls[index].question = e.target.value;
              setForm({ ...form, polls: newPolls });
            }}
          />
          {poll.options.map((opt, optIdx) => (
            <InputField
              className="mt-2"
              key={optIdx}
              placeholder={`Opción ${optIdx + 1}`}
              value={opt.option}
              onChange={(e) => {
                const newPolls = [...form.polls];
                newPolls[index].options[optIdx].option = e.target.value;
                setForm({ ...form, polls: newPolls });
              }}
            />
          ))}
        </div>
      ))}

      <Button type="submit">Crear hilo</Button>
    </form>
  );
}
