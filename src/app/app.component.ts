import { Component, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Card {
  bookID: string;
  title: string;
  authors: string;
  average_rating: string;
  isbn: string;
  language_code: string,
  ratings_count: string,
  price: string,
  availableCount: Number
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit, OnDestroy {

  isNonPayment = true;
  isPayment = false;
  isInLogin = false;
  isInPaymentStatus = false;
  title = 'barclays-ecommerce-ui';

  // Constructor
  constructor(private http: HttpClient, private changeDetectorRef: ChangeDetectorRef) { }

  products: Card[] = [];
  prodTemp = [];
  // product cards Paginations
  @ViewChild(MatPaginator) paginator: MatPaginator;
  obs: Observable<any>;
  dataSource: MatTableDataSource<Card>
  ngOnInit() {
    this.isNonPayment = true;
    this.isCart = false;
    this.isPayment = false;
    this.isInLogin = false;
    this.isInPaymentStatus = false;
    this.searchItem = "";
    this.setImageURL();
    let url = "http://localhost:8080/barclays/product/all";
    let obsProductDetails = this.http.get(url);
    obsProductDetails.toPromise().then(data => {
      console.log(data["products"]);
      this.products = data["products"];
      this.prodTemp = data["products"];
      console.log(this.products);
      this.changeDetectorRef.detectChanges();
      this.dataSource = new MatTableDataSource<Card>(this.products);
      this.dataSource.paginator = this.paginator;
      this.obs = this.dataSource.connect();
    });
  }


  ngOnDestroy() {
    if (this.dataSource) {
      this.dataSource.disconnect();
    }
  }
  product = {}
  public payment(index) {
    console.log(index);
    this.isNonPayment = false;
    this.isPayment = true;
    this.isInLogin = false;
    this.isInPaymentStatus = false;
    this.product = this.prodTemp[index];
  }

  phoneNumber = "";
  userName = "";
  emailId = "";
  address = "";
  postResults = ""

  // Direct call to insta Mojo
  public makePayment(inParam) {

    let url = "http://www.instamojo.com/api/1.1/payment-requests/";
    const headers = { 'X-Api-Key': 'test_2259f72c4b9ccb08672815c7346', 'X-Auth-Token': 'test_21509b690cb9a82a35fb02d8e9b' };
    const body = { 'amount': inParam.price, 'purpose': "Test" };

    this.http.post<any>(url, body, { headers }).subscribe(data => {
      this.postResults = data.id;
      console.log(this.postResults);
    });
  }


  /**
   * Order payment
   * @param inParam 
   */
  public orderProduct(inParam) {

    let url = "http://localhost:8080/barclays/payment";
    const headers = {
      'Access-Control-Allow-Origin': 'http://localhost:4200',
      'Access-Control-Allow-Credentials': 'true'
    };
    const body = {
      'userName': this.userName,
      'emailId': this.emailId,
      'phoneNo': this.phoneNumber,
      'address': this.address,
      'amount': inParam.price,
      'purpose': "Order of product : " + inParam.title
    };

    this.http.post<any>(url, body, { 'headers': headers }).subscribe(data => {
      console.log(data);
      this.isNonPayment = false;
      this.isPayment = false;
      this.isInLogin = false;
      this.isInPaymentStatus = true;
      if(data["isSuccess"] == true) {
       alert("Your Order is successfully created and the payment transaction Id is " + data["id"]);
       this.paymentSuccess(data);
      } else {
        this.paymentFailure(data);
      }
    });
  }

  paymentStatus = {};
  /**
   * 
   * @param data 
   */
  public paymentSuccess(data) {
    this.paymentStatus = data;
  }

   /**
   * 
   * @param data 
   */
  public paymentFailure(data) {
    this.paymentStatus = data;
  }

  

  searchItem = ""
  public searchEvent() {
    this.isCart = false;
    this.isNonPayment = true;
    this.isPayment = false;
    this.isInLogin = false;
    this.isInPaymentStatus = false;
    this.products = [];
    this.prodTemp.filter(prod => {
      const title = prod.title;
      if (title.includes(this.searchItem)) {
        this.products.push(prod)
      }
    })
    this.changeDetectorRef.detectChanges();
    this.dataSource = new MatTableDataSource<Card>(this.products);
    this.dataSource.paginator = this.paginator;
    this.obs = this.dataSource.connect();

    /*
    console.log(this.searchItem);
    let url = "http://localhost:8080/barclays/product/title/" + this.searchItem;
    let obsProductDetails = this.http.get(url);
    obsProductDetails.toPromise().then(data => {
      console.log(data["products"]);
      this.products = data["products"];
      this.prodTemp = data["products"];
      console.log(this.products);
      this.changeDetectorRef.detectChanges();
      this.dataSource = new MatTableDataSource<Card>(this.products);
      this.dataSource.paginator = this.paginator;
      this.obs = this.dataSource.connect();
    });
    */
  }

  isCart = false;
  public cartList() {
    this.isNonPayment = true;
    this.isPayment = false;
    this.isInLogin = false;
    this.isInPaymentStatus = false;
    this.isCart = true;
    if(this.userName == "") {
      this.loggedUser = "NoUser";
    }
    let url = "http://localhost:8080/barclays/cart/all/"+this.loggedUser;
    let obsProductDetails = this.http.get(url);
    obsProductDetails.toPromise().then(data => {
      console.log(data["products"]);
      this.products = data["products"];
      this.prodTemp = data["products"];
      console.log(this.products);
      this.changeDetectorRef.detectChanges();
      this.dataSource = new MatTableDataSource<Card>(this.products);
      this.dataSource.paginator = this.paginator;
      this.obs = this.dataSource.connect();
    });
  }

  public addToCart(index) {
    this.addToCartFromPaymentPage(this.prodTemp[index]);
  }

  public addToCartFromPaymentPage(productObject) {
    this.product = productObject;
    let url = "http://localhost:8080/barclays/cart";
    //const headers = { 'Access-Control-Allow-Origin': '*' };
    const headers = {
      'Access-Control-Allow-Origin': 'http://localhost:4200',
      'Access-Control-Allow-Credentials': 'true'
    };
     // TODO : proper user name should be sent
    const body = { 'productId': this.product["bookID"], 'userId': this.loggedUser };

    this.http.post<any>(url, body, { 'headers': headers }).subscribe(data => {
      console.log(data);
      alert(data["responseMessage"]);
    });
  }

  public toggleLow() {
    this.isCart = false;
    this.isNonPayment = true;
    this.isPayment = false;
    this.isInLogin = false;
    this.isInPaymentStatus = false;
    this.products = [];
    // Ascending
    this.prodTemp.sort((a, b) => 0 - (a.average_rating > b.average_rating ? -1 : 1));
    this.products = this.prodTemp;
    this.changeDetectorRef.detectChanges();
    this.dataSource = new MatTableDataSource<Card>(this.products);
    this.dataSource.paginator = this.paginator;
    this.obs = this.dataSource.connect();
  }

  public toggleHigh() {
    this.isCart = false;
    this.isNonPayment = true;
    this.isPayment = false;
    this.isInLogin = false;
    this.isInPaymentStatus = false;
    // Descending
    this.prodTemp.sort((a, b) => 0 - (a.average_rating > b.average_rating ? 1 : -1));
    this.products = this.prodTemp;

    this.changeDetectorRef.detectChanges();
    this.dataSource = new MatTableDataSource<Card>(this.products);
    this.dataSource.paginator = this.paginator;
    this.obs = this.dataSource.connect();
  }

  public removeFromCart(index) {
    this.product = this.prodTemp[index];
    // TODO : proper user name should be sent
    let url = "http://localhost:8080/barclays/cart/"+this.product["bookID"]+"/"+this.loggedUser;
    
    let obsProductDetails = this.http.delete(url);
    obsProductDetails.toPromise().then(data => {
      console.log(data["responseMessage"]);
      alert(data["responseMessage"]);
      this.cartList();
    });
  }

  public getLogIn() {
    this.isInLogin = true;
    this.isCart = false;
    this.isNonPayment = false;
    this.isPayment = false;
  }

  isLoggedIn = false;
  loggedUser="NoUser";

  public logIn() {
    let url = "http://localhost:8080/barclays/logIn/"+this.emailId;
    let obsProductDetails = this.http.get(url);
    obsProductDetails.toPromise().then(data => {
      console.log(data);
      if(data["success"] == true) {
        alert("Login Successful");
        this.isLoggedIn = true;
        this.loggedUser = this.userName;
        console.log(this.loggedUser);
      } else {
        this.emailId =""
        this.phoneNumber = ""
        this.userName = ""
        alert("Invalid User");
      }
      this.ngOnInit();
    });
  }

  ImageURL = [];
  setImageURL() {
    this.ImageURL = [
      {
        "Image": "https://s3-ap-southeast-1.amazonaws.com/he-public-data/red-book-hi8d6431a.png"
      },
      {
        "Image": "https://s3-ap-southeast-1.amazonaws.com/he-public-data/indexa51d5d7.jpeg"
      },
      {
        "Image": "https://s3-ap-southeast-1.amazonaws.com/he-public-data/blue-book-hic09def7.png"
      },
      {
        "Image": "https://s3-ap-southeast-1.amazonaws.com/he-public-data/blue-book-reading-hid3b6f09.png"
      },
      {
        "Image": "https://s3-ap-southeast-1.amazonaws.com/he-public-data/green-book-reading-hiec1b149.png"
      },
      {
        "Image": "https://s3-ap-southeast-1.amazonaws.com/he-public-data/closed-book-cartoon-vector-symbol-icon-design-beautiful-illustr-illustration-isolated-white-background-975033320bc2a72.jpeg"
      },
      {
        "Image": "https://s3-ap-southeast-1.amazonaws.com/he-public-data/inex290acda.jpeg"
      },
      {
        "Image": "https://s3-ap-southeast-1.amazonaws.com/he-public-data/f958c0ca1c1701d236796ed90542a21940742f7.jpeg"
      },
      {
        "Image": "https://s3-ap-southeast-1.amazonaws.com/he-public-data/index5848f8e.png"
      },
      {
        "Image": "https://s3-ap-southeast-1.amazonaws.com/he-public-data/2511916-orange-book-cartoon6cc76e1.jpeg"
      }
    ];
  }
}
