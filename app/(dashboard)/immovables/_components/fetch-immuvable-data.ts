// "use client";
// import { useEffect, useState } from "react";
// import { immovableService } from "../services/inmovableService";
// import { InmovableResponses } from "../services/response/inmovableResponses";

// export default function useInmovableData() {
//   const [data, setData] = useState<InmovableResponses[] | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchData() {
//       try {
//         const response = await immovableService();
//         setData(response);
//       } catch (err) {
//         setError(`Error al encontrar la información: ${err}`);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchData();
//   }, []);

//   return { data, loading, error };
// }
