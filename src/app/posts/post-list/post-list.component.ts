import { Component, Input, OnDestroy, OnInit } from "@angular/core";
import { Post } from '../post.model'
import { PostService } from "../post.service";
import { Subscription } from 'rxjs'
import { PageEvent } from "@angular/material/paginator";
import { AuthService } from "src/app/auth/auth.service";

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})

export class PostListComponent implements OnInit, OnDestroy {
  // posts: any = [
  //   { title: "First Post", content: "This is the first post's content" },
  //   { title: "Second Post", content: "This is the second post's content" },
  //   { title: "Third Post", content: "This is the third post's content" }
  // ];
  posts: Post[] = [];
  isLoading = false;
  private postsSub: Subscription = new Subscription;
  totalPosts = 10
  postsPerPage = 2
  pageSizeOptions = [1, 2, 5, 10]
  currentPage = 1
  private authStatusSubsciption: Subscription = new Subscription;
  userIsAuthenticated = false
  userId: string = '';

  constructor(public postService: PostService, private authService: AuthService){}

  ngOnDestroy(): void {
    this.postsSub.unsubscribe();
    this.authStatusSubsciption.unsubscribe();
  }

  onDelete(id: string): void {
    this.isLoading = true;
    this.postService.deletePost(id).subscribe(() => {
      this.postService.getPosts(this.postsPerPage, this.currentPage)
      this.isLoading = false;
    }, error => {
      this.isLoading = false
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.postService.getPosts(this.postsPerPage, this.currentPage);

    this.postsSub = this.postService.getPostUpdateListener()
      .subscribe((result : { posts: Post[], postCount: number}) => {
        this.posts = result.posts;
        this.totalPosts = result.postCount;
        this.isLoading = false;
      }, error => {
        this.isLoading = false
      });

    this.userIsAuthenticated = this.authService.getAuthStatus();
    this.userId = this.authService.getUserId()

    this.authStatusSubsciption =
      this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated
        this.userId = this.authService.getUserId()
      }, error => {
        this.isLoading = false
      })
  }

  onChangePage(pageEvent: PageEvent){
    this.isLoading = true;
    this.currentPage = pageEvent.pageIndex + 1;
    this.postsPerPage = pageEvent.pageSize;
    this.postService.getPosts(this.postsPerPage, this.currentPage);
  }

}
