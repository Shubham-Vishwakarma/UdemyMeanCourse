import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { Observable, Subject } from 'rxjs'
import { HttpClient } from "@angular/common/http"
import { map } from 'rxjs/operators'
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";

const BACKEND_URL = environment.url + '/posts/'

@Injectable({ providedIn: 'root' })
export class PostService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postCount: number }>();

  constructor(private http: HttpClient, private router: Router){}

  getPosts(postsPerPage: number, currentPage: number){

    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`

    this.http.
      get<{ message: string, posts: any[], maxPosts: number }>
      (BACKEND_URL + queryParams)
      .pipe(map((postData) => {
        return {
          posts: postData.posts.map(post => {
                      return {
                        title: post.title,
                        content: post.content,
                        id: post._id,
                        imagePath: post.imagePath,
                        creator: post.creator
                      };
                    }),
          maxPosts: postData.maxPosts
        };
      }))
      .subscribe((result) => {
        this.posts = result.posts;
        this.postsUpdated.next(
          {
            posts: [...this.posts],
            postCount: result.maxPosts
          })
      });
  }

  getPostUpdateListener(){
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image: File){
    const postData = new FormData();
    postData.append("title", title);
    postData.append("content", content);
    postData.append("image", image, title);

    this.http.post<{message: string, post: Post}>
      (BACKEND_URL, postData)
      .subscribe(() => {
        this.router.navigate(["/"])
      }) ;
  }

  deletePost(postId: string): Observable<any>{
    return this.http.delete(BACKEND_URL + postId);
  }

  getPost(id: string){
    return this.http.get<{_id: string, title: string, content: string, imagePath: string, creator: string}>(BACKEND_URL + id)
  }

  updatePost(id: string, title: string, content: string, image: File | string){

    let postData: FormData | Post;

    if(typeof(image) === "object"){
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    }
    else{
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: ''
      }
    }

    this.http.put(BACKEND_URL + id, postData)
      .subscribe(response => {
        this.router.navigate(["/"])
      })
  }

}
