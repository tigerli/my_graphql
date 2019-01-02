import {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLNonNull
} from 'graphql'

import axios from 'axios'

const API_BASE = "http://localhost:3300"

const UserType = new GraphQLObjectType({
    name: "User",
    fields: {
        id: {
            type: GraphQLString
        },
        name: {
            type: GraphQLString
        }
    }
})

const CommentType = new GraphQLObjectType({
    name: "Comment",
    fields: {
        id: {
            type: GraphQLString
        },
        content: {
            type: GraphQLString
        },
        author: {
            type: UserType,
            resolve: (obj) => {
                return axios.get(`${ API_BASE }/users/${ obj.author }`)
                    .then(response => response.data)
            }
        }
    }
})

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: {
        id: {
            type: GraphQLString
        },
        title: {
            type: GraphQLString
        },
        content: {
            type: GraphQLString
        },
        author: {
            type: UserType,
            resolve: (obj) => {
                return axios.get(`${ API_BASE }/users/${ obj.author }`)
                    .then(response => response.data)
            }
        },
        comments: {
            type: new GraphQLList(CommentType),
            resolve: (obj) => {
                return axios.get(`${ API_BASE }/posts/${ obj.id }/comments`)
                    .then(response => response.data)
            }
        }
    }
})

const QuertRootType = new GraphQLObjectType({
    name: "QyertRoot",
    fields: {
        greeting: {
            type: GraphQLString,
            resolve: () => 'hello'
        },
        posts: {
            type: new GraphQLList(PostType),
            resolve: () => {
                return axios.get(`${ API_BASE }/posts`)
                    .then(response => response.data )
            }
        },
        post:{
            type: PostType,
            args: {
                id: {
                    type: GraphQLString
                }
            },
            resolve: (obj, args, context) => {
                return axios.get(`${ API_BASE }/posts/${ args.id }`)
                    .then(response => response.data)
            }
        }
    }
})

// 数据操作
const MutationRootType = new GraphQLObjectType({
    name: "MutationRoot",
    fields: {
        // 修改数据
        createPost: {
            type: PostType,
            args: {
                title: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                content: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                author: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (obj, args) => {
                return axios.post(`${ API_BASE }/posts`, {
                    ...args
                })
                    .then(response => response.data)
            }
        },
        // 修改数据
        updatePost: {
            type: PostType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString)
                },
                title: {
                    type: GraphQLString
                },
                content: {
                    type: GraphQLString
                },
                author: {
                    type: GraphQLString
                }
            },
            resolve: (obj, args) => {
                return axios.patch(`${ API_BASE }/posts/${ args.id }`, {
                    ...args
                })
                    .then(response => response.data)
            }
        },
        // 删除数据
        deletePost: {
            type: PostType,
            args: {
                id: {
                    type: new GraphQLNonNull(GraphQLString)
                }
            },
            resolve: (obj, args) => {
                return axios.delete(`${ API_BASE }/posts/${ args.id }`)
                    .then(response => response.data)
            }
        }
    }
})

export default new GraphQLSchema({
    query: QuertRootType,
    mutation: MutationRootType
})
