import React from "react";

export default function page() {
  return (
    <>
      <form className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            // value={formData.title}
            // onChange={handleChange}
            className="block w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            // value={formData.content}
            // onChange={handleChange}
            className="block w-full border rounded px-3 py-2"
            rows={4}
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          // disabled={mutation.isLoading}
        ></button>
        <p className="text-red-500">Error</p>
        <p className="text-green-500">Thread created successfully!</p>
      </form>
      ----
      <form className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            className="block w-full border rounded px-3 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            className="block w-full border rounded px-3 py-2"
            rows={4}
            required
          />
        </div>
        <div>
          <label htmlFor="isPublic" className="block text-sm font-medium">
            Is Public
          </label>
          <select
            id="isPublic"
            name="isPublic"
            className="block w-full border rounded px-3 py-2"
          >
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {/* {mutation.isLoading ? "Creating..." : "Create Thread"} */}
        </button>
        <p className="text-red-500">Error:</p>
        <p className="text-green-500">Thread created successfully!</p>
      </form>
    </>
  );
}
