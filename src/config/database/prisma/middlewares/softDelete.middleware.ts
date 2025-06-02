import { Prisma } from "@prisma/client";

export const softDeleteMiddleware: Prisma.Middleware = async(params, next) => {
    const modelsWithSOftDelete = ['story', 'post', 'user'];

    if(params.model && modelsWithSOftDelete.includes(params.model)) {
        if(params.action === 'delete') {
            params.action = 'update'
            params.args['data'] = {deletedAt: new Date()}
        }
        if(params.action === 'deleteMany'){
            params.action = 'updateMany'
            if(!params.args.data) params.args.data = {}
            params.args.data.deletedAt = new Date()
        }
        if(params.action === 'findMany') {
            if(!params.args.where) params.args.where = {}
            params.args.where.deletedAt = null
        }
        if(params.action === 'findFirst') {
            if(!params.args.where) params.args.where = {}
            params.args.where.deletedAt = null
        }
    }

    return next(params)
}