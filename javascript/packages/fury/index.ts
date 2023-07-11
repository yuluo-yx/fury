import { genReadSerializer, genWriteSerializer, TypeDescription } from './lib/codeGen';
import { Serializer, Fury, InternalSerializerType, Hps } from './lib/type';
import FuryInternal from './lib/fury';

export {
    Serializer,
    InternalSerializerType,
    TypeDescription,
}


export const Type = {
    string() {
        return {
            type: InternalSerializerType.STRING as const
        }
    },
    array<T extends TypeDescription>(def: T) {
        return {
            type: InternalSerializerType.ARRAY as const,
            asArray: {
                item: def
            }
        }
    },
    map() {
        return {
            type: InternalSerializerType.MAP as const,
        }
    },
    bool() {
        return {
            type: InternalSerializerType.BOOL as const,
        }
    },
    object<T extends { [key: string]: TypeDescription }>(tag: string, props?: T) {
        return {
            type: InternalSerializerType.FURY_TYPE_TAG as const,
            asObject: {
                tag,
                props
            }
        }
    },
    uint8() {
        return {
            type: InternalSerializerType.UINT8 as const,
        }
    },
    uint16() {
        return {
            type: InternalSerializerType.UINT16 as const,
        }
    },
    uint32() {
        return {
            type: InternalSerializerType.UINT32 as const,
        }
    },
    uint64() {
        return {
            type: InternalSerializerType.UINT64 as const,
        }
    },
    int8() {
        return {
            type: InternalSerializerType.INT8 as const,
        }
    },
    int16() {
        return {
            type: InternalSerializerType.INT16 as const,
        }
    },
    int32() {
        return {
            type: InternalSerializerType.INT32 as const,
        }
    },
    int64() {
        return {
            type: InternalSerializerType.INT64 as const,
        }
    },
    float() {
        return {
            type: InternalSerializerType.FLOAT as const,
        }
    },
    double() {
        return {
            type: InternalSerializerType.DOUBLE as const,
        }
    },
    binary() {
        return {
            type: InternalSerializerType.BINARY as const,
        }
    },
    date() {
        return {
            type: InternalSerializerType.DATE as const,
        }
    },
    timestamp() {
        return {
            type: InternalSerializerType.TIMESTAMP as const,
        }
    }
}

//#region template function
type Props<T> = T extends {
    asObject: {
        props?: infer T2 extends { [key: string]: any }
    }
} ? {
        [P in keyof T2]: ToRecordType<T2[P]>
    } : unknown

type ItemProps<T> = T extends {
    asArray: {
        item: infer T2 extends TypeDescription
    }
} ? ToRecordType<T2>[] : unknown

export type ToRecordType<T> = T extends {
    type: InternalSerializerType.FURY_TYPE_TAG
} ? (
        Props<T>
    ) : (
        T extends {
            type: InternalSerializerType.STRING
        } ? (
            string
        ) : (
            T extends {
                type: InternalSerializerType.UINT8
                | InternalSerializerType.UINT16
                | InternalSerializerType.UINT32
                | InternalSerializerType.UINT64
                | InternalSerializerType.INT8
                | InternalSerializerType.INT16
                | InternalSerializerType.INT32
                | InternalSerializerType.INT64
                | InternalSerializerType.FLOAT
                | InternalSerializerType.DOUBLE

            } ? (
                number
            ) : (
                T extends {
                    type: InternalSerializerType.MAP
                } ? (
                    Map<any, any>
                ) : (
                    T extends {
                        type: InternalSerializerType.ARRAY
                    } ? (
                        ItemProps<T>
                    ) : (
                        T extends {
                            type: InternalSerializerType.BOOL
                        } ? (
                            boolean
                        ) : (
                            T extends {
                                type: InternalSerializerType.DATE
                            } ? (
                                Date
                            ) : (
                                T extends {
                                    type: InternalSerializerType.TIMESTAMP
                                } ? (
                                    number
                                ) : (
                                    T extends {
                                        type: InternalSerializerType.BINARY
                                    } ? (
                                        Buffer
                                    ) : unknown
                                )
                            )
                        )
                    )
                )
            )
        )
    )

//#endregion


export default class {
    constructor(private config?: {
        hps: Hps | null;
    }) {

    }
    private fury: Fury = FuryInternal(this.config);

    registerSerializer(description: TypeDescription) {
        if (description.type !== InternalSerializerType.FURY_TYPE_TAG || !description.asObject?.tag) {
            throw new Error('root type should be object')
        }
        genReadSerializer(
            this.fury,
            description,
        );
        genWriteSerializer(
            this.fury,
            description
        );
        const serializer = this.fury.classResolver.getSerializerByTag(description.asObject.tag);
        return {
            serializer,
            serialize: (data: any) => {
                return this.fury.serialize(data, serializer);
            },
            deserialize: (bytes: Buffer) => {
                return this.fury.deserialize(bytes);
            }
        }
    }

    serialize(v: any, serialize?: Serializer) {
        return this.fury.serialize(v, serialize);
    }

    deserialize(bytes: Buffer) {
        return this.fury.deserialize(bytes);
    }
}