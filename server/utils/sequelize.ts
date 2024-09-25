import bcrypt from 'bcrypt'
import {
    Sequelize,
    type HasManyCreateAssociationMixin,
    type InferAttributes,
    type InferCreationAttributes,
    type Options,
} from "@sequelize/core"

import {
    DataTypes,
    Model,
    type CreationOptional,
    type NonAttribute,
} from "@sequelize/core"

import {
    Attribute,
    HasMany,
    NotNull,
    Table,
    CreatedAt,
    UpdatedAt,
    PrimaryKey,
    AutoIncrement,
    BeforeCreate,
    BeforeUpsert,
    Index,
    Unique,
    BeforeSave,
    AllowNull,
    BelongsToMany,
    BelongsTo,
    Default,
} from "@sequelize/core/decorators-legacy"

// import type { SqliteDialect } from "@sequelize/sqlite3";
//   import bcrypt from "bcrypt";
const environment = process.env.NODE_ENV || "development";

//   const options = config[environment as keyof typeof config];
//   export const sequelize = new Sequelize({
//     ...options,
//   } as Options<SqliteDialect>);

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './gancio3.sqlite'
})

export default sequelize

@Table({
    tableName: 'announcements',
})
export class Announcement extends Model<
InferAttributes<Announcement>,
InferCreationAttributes<Announcement>
>    {
    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @PrimaryKey
    @AutoIncrement
    declare readonly id: CreationOptional<number>;
    
    @Attribute(DataTypes.STRING)
    @NotNull
    declare title: string;
    
    @Attribute(DataTypes.STRING)
    declare announcement: string;
    
    @Attribute(DataTypes.BOOLEAN)
    declare visible: string;
    
}

@Table({
    tableName: 'events'
})
export class Event extends Model<
InferAttributes<Event>,
InferCreationAttributes<Event>
> {    
    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @PrimaryKey
    @AutoIncrement
    declare readonly id: CreationOptional<number>
 
    @Attribute(DataTypes.STRING)
    @NotNull
    declare title: string

    @Attribute(DataTypes.STRING)
    @Index
    @Unique
    declare slug: string

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @Index
    declare start_datetime: number

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @Index
    declare end_datetime: number    

    @Attribute(DataTypes.JSON)
    declare media: string

    @Attribute(DataTypes.TEXT)
    declare description: string

    @Attribute(DataTypes.BOOLEAN)
    declare is_visible: boolean

    @Attribute(DataTypes.JSON)
    declare online_locations: string

    @Attribute({
      type: DataTypes.INTEGER.UNSIGNED,
      references: { table: "places", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    })
    declare placeId: number;

    @BelongsToMany(() => Tag, { through: 'event_tags', inverse: { as: 'events' } })
    declare tags?: NonAttribute<Tag[]>

}

@Table({
    tableName: 'tags'
})
export class Tag extends Model<
InferAttributes<User>,
InferCreationAttributes<User>
> {
    @Attribute(DataTypes.STRING)
    @PrimaryKey
    @Index
    @Unique
    declare tag: string;

    // @BelongsToMany(() => Event, { through: 'event_tags' })
    declare events?: NonAttribute<Event[]>
}

@Table({
    tableName: 'places'
})
export class Place extends Model<
    InferAttributes<Place>,
    InferCreationAttributes<Place>
> {
    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @PrimaryKey
    @AutoIncrement
    declare readonly id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    @Index
    @Unique
    @NotNull
    declare name: string;

    @Attribute(DataTypes.STRING)
    declare address: string;

    @Attribute(DataTypes.FLOAT)
    declare latitude: number;

    @Attribute(DataTypes.FLOAT)
    declare longitude: number;

    @HasMany(() => Event, /* foreign key */ 'placeId')
    declare events?: NonAttribute<Event[]>;

}

type Role = "admin" | "editor" | "user"

  @Table({
    tableName: "users",
    indexes: [{ fields: ["email"], unique: true }],
  })
  export class User extends Model<
    InferAttributes<User>,
    InferCreationAttributes<User>
  > {
    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @PrimaryKey
    @AutoIncrement
    declare readonly id: CreationOptional<number>;

    @Attribute(DataTypes.STRING)
    declare display_name: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare email: string;

    @Attribute(DataTypes.STRING)
    @NotNull
    declare password: string

    @Attribute(DataTypes.STRING)
    declare recover_code: string

    @Attribute(DataTypes.BOOLEAN)
    declare is_active: Boolean

    @Attribute(DataTypes.STRING)
    declare description: string

    @Attribute(DataTypes.ENUM(['admin','editor', 'user']))
    declare role: Role


    @CreatedAt
    declare readonly createdAt: CreationOptional<Date>;

    @UpdatedAt
    declare readonly updatedAt: CreationOptional<Date>;


    async comparePassword (pwd: string) {
        if (!this.password) { return false }
        return bcrypt.compare(pwd, this.password)        
    }
    // @HasMany(() => Post, {
    //   foreignKey: "userId",
    //   inverse: {
    //     as: "author",
    //   },
    // })
    // declare posts?: NonAttribute<Post[]>;

    // declare createPost: HasManyCreateAssociationMixin<Post, "userId">;

    @BeforeSave
    static async hashPassword(instance: User) {
        if(instance.changed('password')) {
            const password = instance.getDataValue('password')
            if (password) {
                const hashedPassword = bcrypt.hashSync(password, 10)
                instance.setDataValue("password", hashedPassword)              
            }
        }
    }
    // @BeforeCreate
    // static async hashPassword(instance: User) {
    //   const password = instance.getDataValue("password");
    //   if (password) {
    //     const hashedPassword = bcrypt.hashSync(password, 10);
    //     instance.setDataValue("password", hashedPassword);
    //   }
    // }
  }

//   @Table({
//     tableName: "Posts",
//   })
//   export class Post extends Model<
//     InferAttributes<Post>,
//     InferCreationAttributes<Post>
//   > {
//     @Attribute(DataTypes.INTEGER.UNSIGNED)
//     @PrimaryKey
//     @AutoIncrement
//     declare readonly id: CreationOptional<number>;

//     @Attribute(DataTypes.STRING)
//     @NotNull
//     declare title: string;

//     @Attribute(DataTypes.STRING)
//     @NotNull
//     declare content: string;

//     @Attribute({
//       type: DataTypes.INTEGER.UNSIGNED,
//       references: { table: "Users", key: "id" },
//       onUpdate: "CASCADE",
//       onDelete: "CASCADE",
//     })
//     declare userId: number;

//     @CreatedAt
//     declare readonly createdAt: CreationOptional<Date>;

//     @UpdatedAt
//     declare readonly updatedAt: CreationOptional<Date>;

//     /** Declared by {@link User#posts} */
//     declare author?: NonAttribute<User>;
//   }


@Table({
    tableName: 'instances'
})
export class Instance extends Model<
    InferAttributes<Instance>,
    InferCreationAttributes<Instance>
> {
    @Attribute(DataTypes.STRING)
    @PrimaryKey
    declare domain: string

    @Attribute(DataTypes.STRING)
    declare name: string

    @Attribute(DataTypes.BOOLEAN)
    declare blocked: boolean

    @Attribute(DataTypes.JSON)
    declare data: string;

    @Attribute(DataTypes.STRING)
    declare applicationActor: string;

    // @HasMany(() => Event, /* foreign key */ 'placeId')
    // declare events?: NonAttribute<Event[]>;

}


type APUserObject = { 
    name: string,
    icon: { url: string },
    summary?: string,
    preferredUsername: string,

}

@Table({
    tableName: 'ap_users'
})
export class APUser extends Model<
    InferAttributes<APUser>,
    InferCreationAttributes<APUser>
> {
    @Attribute(DataTypes.STRING)
    @PrimaryKey
    declare ap_id: string

    @Attribute(DataTypes.BOOLEAN)
    declare follower: boolean

    @Attribute(DataTypes.BOOLEAN)
    declare following: boolean

    @Attribute(DataTypes.BOOLEAN)
    declare trusted: boolean

    @Attribute(DataTypes.BOOLEAN)
    declare blocked: boolean

    @Attribute(DataTypes.JSON)
    declare object: APUserObject;

    // @HasMany(() => Event, /* foreign key */ 'placeId')
    // declare events?: NonAttribute<Event[]>;

}

@Table({
    tableName: 'settings'
})
export class Setting extends Model<
    InferAttributes<Setting>,
    InferCreationAttributes<Setting>
> {
    @Attribute(DataTypes.STRING)
    @PrimaryKey
    declare key: string

    @Attribute(DataTypes.JSON)
    declare value: string

    @Attribute(DataTypes.BOOLEAN)
    @Default(false)
    declare is_secret: boolean
}

@Table({
    tableName: 'collections',
    timestamps: false
})
export class Collection extends Model<
    InferAttributes<Collection>,
    InferCreationAttributes<Collection>
> {

    @Attribute(DataTypes.INTEGER.UNSIGNED)
    @PrimaryKey
    @AutoIncrement
    declare readonly id: CreationOptional<number>

    @Attribute(DataTypes.STRING)
    @Unique
    @Index
    @NotNull
    declare name: string

    @Attribute(DataTypes.BOOLEAN) // not used yet
    declare isActor: boolean

    @Attribute(DataTypes.BOOLEAN) // is this collection shown in top navbar in home page?
    declare isTop: boolean
}

sequelize.addModels([Announcement, Place, Event, Tag, User, Instance, APUser, Setting, Collection]);