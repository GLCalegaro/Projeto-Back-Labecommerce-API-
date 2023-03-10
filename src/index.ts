// import { products,
//      users,
//      purchase } from "./database";
import express, {Request, Response} from 'express';
import cors from 'cors';
// import { Category, TProduct, TPurchase, TUser, TProductsInPurchase } from "./types";
import { db } from './database/knex';
import { TProduct, TProductQuantity, TPurchANDProd, TPurchaseDB, TPurchasesProductsDB, TUser, TUserDB } from './types';

const app = express();

app.use(express.json());
app.use(cors());

app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003")
})

app.get("/ping",(req:Request,res:Response)=>{
    res.send("Pong")
})

// Pegar Usuarios
app.get("/users", async (req:Request, res:Response)=>{
    try{
        const result = await db("users")
        res.status(200).send({"Array de Users do arquivo labecommerce.db": result});
    }catch (error){
        console.log(error);

        if(res.statusCode === 200){
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

// //Pegar Produtos
app.get("/products", async(req:Request, res:Response)=>{
    try{
        const result = await db("products")
        res.status(200).send({"Array de Produtos do arquivo labecommerce.db": result});
    }catch (error){
        console.log(error);

        if(res.statusCode === 200){
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

//Pegar Compras
app.get("/purchases", async (req:Request,res:Response)=>{
    try{
        const result = await db("purchases")
        res.status(200).send({"Array de Compras do arquivo labecommerce.db": result});
    }catch (error){
        console.log(error);

        if(res.statusCode === 200){
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

//Pesquisa compra p/ ID c/ query builder
app.get("/purchases/:id", async (req:Request,res:Response)=>{
    try{
        const id = req.params.id

        const [purchase]:TPurchaseDB[] = await db("purchases").where({id: id})
        if(!purchase){
            res.status(404)
            throw new Error("Id da Compra n??o encontrada!")
        }
        
        const pp: TPurchasesProductsDB[] = await db("purchases_products").where({purchase_id: id})
        const array: TProductQuantity[]=[]
        for(let i of pp){
            const [produto]:TProduct[] | undefined[] = await db("products").where({id: i.product_id})
            if(!produto){
                res.status(404)
                throw new Error("Produto n??o consta na compra!")
            }
        const prodquant: TProductQuantity={
            id: produto.id,
            name: produto.name,
            price: produto.price,
            description: produto.description,
            imageUrl: produto.imageUrl,
            quantity: i.quantity
        }
        array.push(prodquant)
        }
        const [usuarios]: TUserDB[] | undefined[] = await db("users").where({id: purchase.buyer_id})
        if(!usuarios){
            res.status(404)
            throw new Error("Usu??rio n??o registrado nessa compra.")
        }
        
        res.status(200).send({
            purchaseId: purchase.id,
            buyerId: usuarios.id,
            buyerName: usuarios.name,
            buyerEmail: usuarios.email,
            totalPrice: purchase.total_price,
            createdAt: purchase.createdAt,
            paid: purchase.paid,
            products: array}as TPurchANDProd)
    }catch (error){
        console.log(error);

        if(res.statusCode === 200){
            res.status(500)
        }
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

//Retornando Lista de produtos de acordo c/ Compras
// app.get("/purchases_products/:id", async (req: Request, res: Response) =>{
//     const id = req.params.id
//     try{
//         const allpurchs = await db("purchases")
//         .innerJoin(
//             "users",
//             "purchases.buyer_id",
//             "=",
//             "users.id",
//         ).where({"purchases.id":id});

//         const productsList = await db("purchases_products")
//         .innerJoin(
//             "products",
//             "purchases_products.product_id",
//             "=",
//             "products.id",
//         )
    
//         res.status(200).send({
//             allpurchs, productsList
//         })
//         } catch (error) {
//             console.log(error)
    
//             if (req.statusCode === 200) {
//                 res.status(500)
//             }
    
//             if (error instanceof Error) {
//                 res.send(error.message)
//             } else {
//                 res.send("Erro inesperado")
//             }
//         }
//     })

//Pesquisa prod p/ nome
app.get("/products/search", async(req:Request, res:Response)=>{
    try {
    const q = req.query.q as string;
        if (q.length <= 1){
            res.status(400)
            throw new Error("Query params deve possuir pelo menos um caractere.")
        }
        const product = await db.raw(`
        SELECT * FROM products
        WHERE LOWER(name) LIKE("%${q}%");      
 `)
    res.status(200).send({product: product});
}catch (error){
    console.log(error);

    if(res.statusCode === 200){
        res.status(500)
    }
    if (error instanceof Error) {
        res.send(error.message)
    } else {
        res.send("Erro inesperado")
    }
}
})

//Cadastro de novo usu??rio
app.post("/users", async (req:Request,res:Response)=>{
    try{
        const {id, name, email, password, createdAt} = req.body
        const [ user ] = await db.select("*").from("users")
    
        if (id !== undefined) {
        if (name !== undefined) {
        if (email != undefined){
        if (password != undefined){
        
            // validamos que ?? uma string
          if (typeof id !== "string") {
            res.status(400)
            throw new Error("'Id' inv??lida, deve ser uma string");
            }
          if (typeof name !== "string") {
            res.status(400)
            throw new Error("'Name' inv??lida, deve ser uma string");
            }
          if (typeof email != "string") {
            res.status(400)
            throw new Error("'Email' inv??lido, deve ser uma string");
            }
          if (typeof password != "string") {
            res.status(400)
            throw new Error("'Password' inv??lida, deve ser uma string");
            }
        }}}
            // verificamos no array clients se j?? existe esse cpf cadastrado
            const newClient:TUser ={
                id,
                name,
                email,
                password,
            }
    
            await db("users").insert(newClient)
        
        }
        await db.raw(`
            INSERT INTO users (id, name, email, password) 
            VALUES ("${id}", "${name}", "${email}","${password}");
            `)

            res.status(201).send(`Cadastro de usu??rio com 'Id': ${id} realizado com sucesso`)
        // continua????o do c??digo...
    } catch (error) {
        console.log(error)

        if (res.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

//Cadastro de novo produto
app.post("/products", async (req:Request,res:Response)=>{
    try{
        const {id, name, price, description, imageUrl} = req.body
    
        // if (id !== undefined) {
        // if (name != undefined){
        // if (price != undefined){
        // if(description != undefined){
        // if(imageUrl != undefined){
        //     // validamos que ?? uma string
        //   if (typeof id !== "string") {
        //     res.status(400)
        //         throw new Error("'Id' deve ser uma string")
        //     }
        //   if (typeof name != "string") {
        //     res.status(400)
        //     throw new Error("'Name' deve ser uma string")
        //     }
        //   if (typeof price != "number") {
        //     res.status(400)
        //         throw new Error("'Price' deve ser um n??mero")
        //     }
        //   if (typeof description != "string") {
        //     res.status(400)
        //         throw new Error("'Category' deve ser uma string")
        //     }
        //   if (typeof imageUrl != "string") {
        //     res.status(400)
        //         throw new Error("'Category' deve ser uma string")
        //     }
        //   }}}}
            // verificamos no array clients se j?? existe esse cpf cadastrado
            const newProduct:TProduct = {
                id,
                name,
                price,
                description,
                imageUrl,
            }
    
            await db("products").insert(newProduct)
    
            res.status(201).send({message:'Produto cadastrado com sucesso!', product: newProduct})
            
        } catch (error) {
            console.log(error)
    
            if(res.statusCode === 200){
                res.status(500)
            }
                    
            if (error instanceof Error) {
                res.send(error.message)
            } else {
                res.send("Erro inesperado")
            }  
        }
    })

//Cadastro de nova Compra
app.post("/purchases", async(req:Request,res:Response)=>{
try{
    const {id, buyer_id, total_price, paid, products} = req.body
    
    
    if (id !== undefined) {
        if (buyer_id != undefined){
        if (total_price != undefined){
            // validamos que ?? uma string
          if (typeof id !== "string") {
            res.status(400)
                throw new Error("'Id' deve ser uma string")
            }
          if (typeof buyer_id != "string") {
            res.status(400)
            throw new Error("'buyer_id' deve ser uma string")
            }
          if (typeof total_price != "number") {
            res.status(400)
                throw new Error("'total_price' deve ser um n??mero")
            }
        }}}
        //await db("purchase").where({id: id}) - Verificar se o id da compra j?? existe
        await db.raw(`
        INSERT INTO purchases (id, buyer_id, total_price, paid) 
        VALUES ("${id}","${buyer_id}","${total_price}", "${paid}");
        `);
        //await db("purchases").insert({id:id, buyer:buyer})
        //for (let i of products) {
    //    await db("purchases_products").insert({
    //             purchase_id: purchaseId,
    //             product_id: i.id,
    //             quantity: i.quantity
    //         })
    //     }

        res.status(201).send({ message: "Pedido realizado com sucesso" })
        for(let product of products){
            await db.raw(`INSERT INTO purchases_products (purchase_id, product_id, quantity)
            VALUES ("${id}", "${product.id}", "${product.quantity})`)
        }

        await db.raw(`
        INSERT INTO purchases_products()
        `)

        res.status(201).send(`Cadastro de compra com 'Id': ${id} realizada com sucesso`)
    // continua????o do c??digo...
} catch (error) {
    console.log(error)

    if (res.statusCode === 200) {
        res.status(500)
    }

    if (error instanceof Error) {
        res.send(error.message)
    } else {
        res.send("Erro inesperado")
    }
}
})

//Products by ID
app.get("/products/:id", async(req:Request, res:Response)=>{
    try{
    const id = req.params.id
    const [result] = await db.raw(`
        SELECT * FROM products
        WHERE id = "${id}"
    `)

    if(!result){
        res.status(404)
        throw new Error("ID de produto n??o encontrado!")
    }
            res.status(200).send({"Produto encontrado": result})
    }catch (error:any){
        console.log(error);

        if(res.statusCode === 200){
            res.status(500)
        }
        res.send(error.message)
    }
});

//Purchase Users by ID
app.get("/users/:id/purchases", async(req:Request, res:Response)=>{
try{
    const id = req.params.id;
    const result = await db.raw(`
        SELECT * FROM purchases
        WHERE buyer_id = "${id}"
    `)
    if(!result){
        res.status(404)
        throw new Error("O ID de usu??rio n??o existe ou n??o possui compras!")
    }
        res.status(200).send({"Compras do usu??rio": result})
    } catch (error) {
        console.log(error)

        if (res.statusCode === 200) {
            res.status(500)
        }

        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }
    }
})

//Remove user by ID
app.delete("/users/:id", async(req:Request, res:Response) =>{
try{
    // const id = req.params.id
    // const result = users.find((user)=> user.id === id);
    //Refatorando com query builder
    const idToDelete = req.params.id
    const [ user ] = await db("users").where({id: idToDelete})

    // if(!result){
    //     res.status(404)
    //     throw new Error("ID de usu??rio n??o consta na base de dados!")
    // }

    if(!user){
        res.status(404)
        throw new Error("ID de usu??rio n??o consta na base de dados!")
    }

    //Encontrar ??ndice do item a ser removido
    // const indexToRemove = users.findIndex((user) => user.id === id)
    // //Deletar apenas se encontrar o item:
    // if(indexToRemove >= 0){
    // //Splice para editar diretamente o array users
    // //Primero arg ?? o ??ndice alvo
    // //Segundo arg ser??o qnts itens ser??o removidos a partir do primeiro arg
    // users.splice(indexToRemove,1)
    // }
    await db("users").del().where({ id: idToDelete })
    res.status(200).send({message: `Usu??rio removido com sucesso!`})
} catch (error) {
    console.log(error)

    if (req.statusCode === 200) {
        res.status(500)
    }

    if (error instanceof Error) {
        res.send(error.message)
    } else {
        res.send("Erro inesperado")
    }
}
})

//Remove product by ID
app.delete("/products/:id", async(req:Request, res:Response) =>{
    try{
    const id = req.params.id
    const [filterProd]: TProduct[] | undefined[] = await db("products").where({id:id})
        
        if(filterProd){
            await db("products").del().where({id:id})
            res.status(200).send({message:"Produto excluido com sucesso",product: filterProd})
        }else{
            res.status(400)
            throw new Error("Produto n??o localizado!")
        }
        
    } catch (error) {
        console.log(error)

        if(res.statusCode === 200){
            res.status(500)
        }
                
        if (error instanceof Error) {
            res.send(error.message)
        } else {
            res.send("Erro inesperado")
        }   
    }

})
//Remove purchase by ID
app.delete("/users/:id/purchases", async(req:Request, res:Response) =>{
    try{
    // const id = req.params.id
    // const result = purchase.find((purch)=> purch.userId === id);
    //Refatorando com query builder
    const idPurchToDel = req.params.id
    const  purchases  = await db("purchases").where({id: idPurchToDel})

    // if(result){
    //     res.status(404)
    //     throw new Error("ID da compra n??o consta na base de dados!")
    // }
    await db("purchases").del().where({id: idPurchToDel})
    if(!purchases){
        res.status(404)
        throw new Error("ID da compra n??o consta na base de dados!")
    }

    //Encontrar ??ndice do item a ser removido
    // const indexToRemove = purchase.findIndex((purch) => purch.userId === id)
    // //Deletar apenas se encontrar o item:
    // if(indexToRemove >= 0){
    //Splice para editar diretamente o array users
    //Primero arg ?? o ??ndice alvo
    //Segundo arg ser??o qnts itens ser??o removidos a partir do primeiro arg
    // purchase.splice(indexToRemove,1)
    // }
    res.status(200).send({message: `Compra removido com sucesso!`})
} catch (error) {
    console.log(error)

    if (req.statusCode === 200) {
        res.status(500)
    }

    if (error instanceof Error) {
        res.send(error.message)
    } else {
        res.send("Erro inesperado")
    }
}
})

app.put("/users/:id", async (req:Request, res:Response) =>{
    try{
        // const id = req.params.id
        // const result = users.filter((user)=> user.id === id);

    //Refatorando p/ query builder
        const id = req.params.id
        
        const newName = req.body.name
        const newEmail = req.body.email
        const newPassword = req.body.password

        // if(!result){
        //     res.status(404)
        //     throw new Error("ID de usu??rio n??o existe na base dados para edi????o!")
        // }
    // const newEmail = req.body.email as string | undefined
	// const newPassword = req.body.password as string | undefined

    // const user = users.find((user) => user.id === id)
    
    // if(user){
    // //user.email = (newEmail === undefined ? user.email === newEmail)
    // //user.password = (newPassword === undefined ? user.password === newPassword)
    // user.email = newEmail || user.email
    // user.password = newPassword || user.password
    // }
    // const newUser = {
    //     newEmail,
    //     newPassword
    // }
    if (newName !== undefined) {

        if (typeof newName !== "string") {
            res.status(400)
            throw new Error("'Name' deve ser string")
        }

        if (newName.length < 1) {
            res.status(400)
            throw new Error("'Name' deve possuir no m??nimo 1 caractere")
        }
    }

    if (newEmail !== undefined) {

        if (typeof newEmail !== "string") {
            res.status(400)
            throw new Error("'Email' deve ser string")
        }

        if (newEmail.length < 2) {
            res.status(400)
            throw new Error("'Email' deve possuir no m??nimo 2 caracteres")
        }
    }

    if (newPassword !== undefined) {

        if (typeof newPassword !== "string") {
            res.status(400)
            throw new Error("'Password' deve ser number")
        }

        if (newPassword.length < 1) {
            res.status(400)
            throw new Error("'Password' n??o pode possuir ao menos 6 caracteres")
        }
    }
    const [ user ] = await db("users").where({ id: id })

    if (user) {
        const updatedUser = {
            name: newName|| user.name,
            email: newEmail || user.email,
            password: newPassword || user.password,
        }

        await db("users").update(updatedUser).where({ id: id })

    } else {
        res.status(404)
        throw new Error("'Id' n??o consta na base de dados para atualiza????o!")
    }

    res.status(200).send({ message: "Atualiza????o de usu??rio realizada com sucesso" })
} catch (error) {
    console.log(error)

    if (req.statusCode === 200) {
        res.status(500)
    }

    if (error instanceof Error) {
        res.send(error.message)
    } else {
        res.send("Erro inesperado")
    }
}
})
//     res.status(200).send("Cadastro de usu??rio atualizado com sucesso!")
// }catch (error:any){
//     console.log(error);

//     if(res.statusCode === 200){
//         res.status(500)
//     }
//     res.send(error.message)
// }
// });

//Editar produto por ID:
app.put("/products/:id", async(req:Request, res:Response) =>{
    try{
        const id = req.params.id
    //     const result = products.filter((product)=> product.id === id);
    
    //     if(!result){
    //         res.status(404)
    //         throw new Error("ID de produto n??o existe na base dados para edi????o!")
    //     }
    //Refatorando p/ query builder
    const newId = req.body.id      
    const newName = req.body.name
    const newPrice = req.body.price
    const newDescription = req.body.description
    const newImgurl = req.body.imageUrl
    // const newName = req.body.name as string | undefined
	// const newPrice = req.body.price as number | undefined
    // const newCategory = req.body.category as Category | undefined

    // const product = products.find((product) => product.id === id)
    if (newId !== undefined) {

        if (typeof newId !== "string") {
            res.status(400)
            throw new Error("'Id' deve ser string")
        }

        if (newId.length < 1) {
            res.status(400)
            throw new Error("'Id' deve possuir no m??nimo 1 caractere")
        }
    }

    if (newName !== undefined) {

        if (typeof newName !== "string") {
            res.status(400)
            throw new Error("'Name' deve ser string")
        }

        if (newName.length < 4) {
            res.status(400)
            throw new Error("'Name' deve possuir no m??nimo 4 caracteres")
        }
    }

    if (newPrice !== undefined) {

        if (typeof newPrice !== "number") {
            res.status(400)
            throw new Error("'Price' deve ser number")
        }
    }
    if (newDescription !== undefined) {

        if (typeof newDescription !== "string") {
            res.status(400)
            throw new Error("'Description' deve ser string")
        }
    }
    const [ product ] = await db("products").where({ id: id })

    if(product){
        const updatedProduct = {
    //user.email = (newName === undefined ? user.email === newName)
    //user.password = (newPrice === undefined ? user.password === newPrice)
    id: newId || product.id,
    name: newName || product.name,
    price: newPrice || product.price,
    description: newDescription || product.description,
    imageUrl: newImgurl|| product.imageUrl
}

    await db("products").update(updatedProduct).where({ id: id })

} else {
    res.status(404)
    throw new Error("'Id' de produto n??o consta na base de dados para atualiza????o!")
}

    res.status(200).send({message: "Cadastro de produto atualizado com sucesso!"})
}catch (error:any){
    console.log(error);

    if(res.statusCode === 200){
        res.status(500)
    }
    res.send(error.message)
}
});



