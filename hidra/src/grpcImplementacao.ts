import { Request, Response, NextFunction } from 'express';
import { getRepository } from 'typeorm';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from './entity/User';

export default class implementacao {
  async saveUser(req: Request, res: Response) {
    const { username, email, password } = req.body;

    try {
      const passwordHash = await bcrypt.hash(password, 8);
      
      const user = await getRepository(User).save({
        username,
        email,
        password: passwordHash
      });
      
      const token_register = jwt.sign({ username }, process.env.SECRET, {
        expiresIn: '1d'
      });

      const data = {
        id: user.id,
        username: user.username,
        email: user.email,
        token: token_register
      }
      
      return res.status(201).json(data);

    } catch (error) {
      return res.status(402).json({ message: "erro user controller" })
    }
  }

  async auth(req: Request, res: Response, next: NextFunction) {
    const auth_header = req.headers.authorization;
    
    if (!auth_header) {
      return res.status(401).json({ message: 'token nulo' });
    }
    
    const [, token] = auth_header.split(' ');

    try {
      await jwt.verify(token, process.env.SECRET);
      next();
    }
    catch (error) {
      return res.status(401).json({ message: 'token expirou' })
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
  
    try {
      const user = await getRepository(User).find({
        where: {
          email
        }
      });
  
      if (await bcrypt.compare(password, user[0].password)) {
  
        const token_login = jwt.sign({ email }, process.env.SECRET, {
          expiresIn: '1d'
        });
  
        const data = {
          id: user[0].id,
          nome: user[0].username,
          email: user[0].email,
          token: token_login
        }
            
        return res.json(data);
      } else {
        return res.status(404).json({ messge: "erro no login controler" })
      }
  
    } catch (err) {
      return res.status(402).json({ message: "erro user controller" })
    }
  }

  async getUser(req: Request, res: Response) {
    try{
      const id = req.params.id;
    
      const user = await getRepository(User).findOne({
        select: ['id', 'username', 'email'],
        where: {
          id
        }
      });

      return res.json(user);
    } catch (error) {
      return res.status(404).json({ message: "erro ao pegar usuario" })
    }
  }
}