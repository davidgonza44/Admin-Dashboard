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
    }

    if (body.errors){
        const errors = body?.errors;
        const messages = errors.map((error) => error.message)?.join('\n')
        const code = errors[0]?.extensions?.code
        return {
            message : messages | JSON.stringify(errors)
            statusCode : code || 500
        }
    }
}