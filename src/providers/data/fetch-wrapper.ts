import { GraphQLFormattedError } from "graphql";

type Error = {
    message : string,
    statusCode : string
}


const customFetch = async(url : string, options : RequestInit) => {
    const accessToken = localStorage.getItem("accessToken")
    const headers = options.headers as Record<string, string>;
    return await fetch(url , {
        ...options,
        headers: {
            ...headers,
            Authorization: `Bearer ${accessToken}`,
            "Content-type" : "application/json",
            "Apollo-Require-Preflight" : "true" //evita errores cors croos origin
        }
    })

}

const getGraphQlErrors = (body : Record<"errors", GraphQLFormattedError[] | undefined> ) : Error | null => {
    if (!body){
        return {
            message : "Error desconocido",
            statusCode : "INTERNAL_SERVER_ERROR"
        }
    };

    if (body.errors){
        const errors = body?.errors;
        const messages = errors.map((error) => error.message)?.join('\n')
        const code = errors[0]?.extensions?.code
        return {
            message : messages || JSON.stringify(errors),
            statusCode : code || 500
        }
    };

    return null
}


const fetchWrapper = async(url : string, option: RequestInit)=>{
    const response = await customFetch(url, option)
    const responseClone = response.clone()
    const body = await responseClone.json()
    const errors = getGraphQlErrors(body)
    if (errors){
        throw new Error
    }
    return body
}