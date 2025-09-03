import axios, { AxiosError, AxiosResponse } from "axios";

export const postRequestHandler = <T>(route: string, data: object, onSuccess?: (data: AxiosResponse<T>) => unknown, setError?: (error: Error) => unknown) => {
	return new Promise((resolve, reject) => {
		(async () => {

			if (route[0] !== '/')
				route = '/' + route;

			try {
				const result = await axios.post('http://localhost:1337' + route, data, {
					withCredentials: true,
					headers: {
						Authorization: "Bearer " + localStorage.getItem('jwt')
					}
				})

				if(onSuccess)
					await onSuccess(result)

				resolve(result);
			} catch (error) {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const axiosError = error as AxiosError<any, any>;
				const result = axiosError.response;
				const resultError = result?.data?.error || result?.data  || error;

				let issue = "";
				if (!resultError.message) {
					//Zod Error
					if (resultError.issues)
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						issue = resultError.issues.map((issue: any) => {
							return issue.message
						}).join('\n')
					else
						issue = "internal server error"
				} else 
					issue = resultError.message
				
				if (setError)
					await setError(new Error(issue.toLowerCase()))

				reject(issue)
			}
		})();
	}) as Promise<AxiosResponse<T>>
}
