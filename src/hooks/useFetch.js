
import { useEffect, useState } from "react";

const useFetch = (url) => {
    const [data, setData] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        const abortController = new AbortController();
        
        fetch(url, { signal: abortController.signal })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Could not fetch data from this resource');
                }
                return res.json();
            })
            .then(data => {
                if (!abortController.signal.aborted) {
                    setData(data);
                    setIsPending(false);
                    setError(null);
                }
            })
            .catch(error => {
                if (!abortController.signal.aborted) {
                    console.error("Loading fetch error:", error);
                    setIsPending(false);
                    setError(error.message);
                }
            });

        return () => {
            abortController.abort();
        };
    }, [url]);

    return { data, isPending, error };
};


export default useFetch;