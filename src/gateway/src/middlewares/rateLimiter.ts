import {redisClient} from "../index";
import { Request, Response, NextFunction } from "express";

export interface RateLimitOptions {
  windowInSeconds: number;
  maxRequests: number;
  keyPrefix?: string;
}

export function rateLimiter(options: RateLimitOptions) {
  const { windowInSeconds, maxRequests, keyPrefix = "ratelimit" } = options;
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userKey = req.ip || req.headers["x-forwarded-for"] || "unknown-ip";
      const redisKey = `${keyPrefix}:${userKey}`;

      const current = await redisClient.incr(redisKey);

      if (current === 1) {
        await redisClient.expire(redisKey, windowInSeconds);
      }

      if (current > maxRequests) {
        const ttl = await redisClient.ttl(redisKey);
        res.setHeader("Retry-After", ttl);
        return res.status(429).json({
          message: "Too many requests. Please try again later.",
          retryAfterSeconds: ttl,
        });
      }
      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      next();
    }
  };
}

// // sliding window log implementation

// class SlidingWindowLog{
//     constructor(windowMs,maxRequests){
//         this.windowMs=windowMs,
//         this.maxRequests=maxRequests
        
//         this.requestLogs=new Map()
//     }
    
//     allowRequests(clientId){
//         const now=Date.now()
//         const windowStart=now - this.windowMs
        
//         if(!this.requestLogs.has(clientId))
//         this.requestLogs.set(clientId,[])
        
//        let timestamps=this.requestLogs.get(clientId)
        
//         timestamps=timestamps.filter((timestamp)=>timestamp>windowStart)
//         this.requestLogs.set(clientId,timestamps)
        
//         if(timestamps.length<this.maxRequests){
//             timestamps.push(now)
//             return true
//         }
//         else
//         {
//             return false
//         }
//     }
// }

// const slidingWindow=new SlidingWindowLog(5000,3)

// for (let i=1;i<7;i++)
// {
//  console.log(`Request ${i} was ${slidingWindow.allowRequests('user-a') ? 'Allowed' :'Denied'}`)   
// }

// setTimeout(()=>{
//     console.log(`Request 7 was ${slidingWindow.allowRequests('user-a') ? 'Allowed' :'Denied'}`) 
//     },5001)


//TokenBucket Implementation
// class TokenBucket{
//     constructor(capacity,refillRatePerSecond){
//         this.capacity=capacity
//         this.refillRatePerSecond=refillRatePerSecond
        
//         this.tokens=capacity
//         this.lastRefillDate=Date.now()
        
//         this.clientBucket=new Map()
//     }
    
//     getBucket(clientId){
//         if(!this.clientBucket.has(clientId)){
//             this.clientBucket.set(clientId,{
//                 tokens:this.capacity,
//                 lastRefillDate:Date.now()
//             })
//             }
//             return this.clientBucket.get(clientId)
//         }
        
//         refillBucket(bucket){
//             const now=Date.now()
//             const elapsedTime=(now-bucket.lastRefillDate)/1000
            
//             if(elapsedTime>0){
//                 const tokensToAdd=elapsedTime*this.refillRatePerSecond
//                 bucket.tokens=Math.min(this.capacity,bucket.tokens+tokensToAdd)
//                 bucket.lastRefillDate=now
//             }
//         }
            
//         allowRequest(clientId){
//             const bucket=this.getBucket(clientId)
//             this.refillBucket(bucket)
            
//             if(bucket.tokens>=1){
//             bucket.tokens-=1
//             return true
//             }
//             else{
//                 return false
//             }
//             }
    
    
// }

// const tokenLimiter=new TokenBucket(10,2)

// // Burst of 10 requests (all allowed)
// for (let i = 1; i <= 10; i++) {
//     console.log(`Request ${i}: ${tokenLimiter.allowRequest('user-b') ? 'Allowed' : 'Denied'}`);
// }
// // Request 11: Denied (Capacity is 10, bucket is now empty)
// console.log(`Request 11: ${tokenLimiter.allowRequest('user-b') ? 'Allowed' : 'Denied'}`);

// // Wait 1 second (2 tokens should be refilled)
// setTimeout(() => {
//     console.log("\n--- After 1 second (2 tokens refilled) ---");
//     // Request 12: Allowed (Bucket: 1 token left)
//     console.log(`Request 12: ${tokenLimiter.allowRequest('user-b') ? 'Allowed' : 'Denied'}`);
//     // Request 13: Allowed (Bucket: 0 tokens left)
//     console.log(`Request 13: ${tokenLimiter.allowRequest('user-b') ? 'Allowed' : 'Denied'}`);
//     // Request 14: Denied
//     console.log(`Request 14: ${tokenLimiter.allowRequest('user-b') ? 'Allowed' : 'Denied'}`);
// }, 1000);