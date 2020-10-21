import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams ,Loading, LoadingController, App} from 'ionic-angular';
import { PointDetailPage } from '../point-detail/point-detail';
import { OffersPage } from '../../offers/offers';
import { DbserviceProvider } from '../../../providers/dbservice/dbservice';
import { HomePage } from '../../home/home';
import { TabsPage } from '../../tabs/tabs';


@IonicPage()
@Component({
  selector: 'page-point-list',
  templateUrl: 'point-list.html',
})
export class PointListPage {
  coupon_list:any=[];
  karigar_point:any={};
  karigar_detail:any={};
  loading:Loading;
  filter:any={};
  last_scanned_date:any='';

  constructor(public navCtrl: NavController,
              public navParams: NavParams,
              public dbService:DbserviceProvider,
              public loadingCtrl:LoadingController,
              private app:App) {

      if(this.dbService.connection=='offline')
      {
            this.dbService.onShowMessageAlertHandler('Offline ! Please Connect To An Active Internet Connection');
            this.navCtrl.setRoot(HomePage)
      }
  }

  ionViewDidLoad() {
    this.filter.active_tab = 'points';

    console.log('ionViewDidLoad PointListPage');
    if(this.dbService.connection!='offline')
    {
    this.getCoupanHistory();
    this.presentLoading();
    console.log(this.loading);
    }

  }

  doRefresh(refresher)
  {
    console.log('Begin async operation', refresher);
    this.getCoupanHistory();
    refresher.complete();
  }

  goOnPointDetailPage(id){
    this.navCtrl.push(PointDetailPage,{'id':id})
  }

  goOnHomePage(){
    // this.navCtrl.setRoot(TabsPage,{index:'0'});
    // this.navCtrl.push(tab)
    this.navCtrl.push(TabsPage);

  }

  getCoupanHistory()
  {
    console.log('coupan');
    this.filter.limit=0;
    console.log( this.loading);

    this.dbService.onPostRequestDataFromApi( {'filter':this.filter,'karigar_id': this.dbService.userStorageData.id },'app_karigar/couponHistory', this.dbService.rootUrl).subscribe( r =>
      {
        console.log(r);
        this.loading.dismiss();
        console.log( this.loading);

        this.coupon_list=r['coupon'];
        this.karigar_point=r['karigar'];
      });
    }
    conInt(val)
    {
      return parseInt(val)
    }
    presentLoading()
    {
      this.loading = this.loadingCtrl.create({
        content: "Please wait...",
        dismissOnPageChange: true,
        enableBackdropDismiss : true
      });
      this.loading.present();
    }

    flag:any='';
    loadData(infiniteScroll)
    {
      console.log('loading');
      this.filter.limit=this.coupon_list.length;
      this.dbService.onPostRequestDataFromApi( {'filter':this.filter,'karigar_id': this.dbService.userStorageData.id },'app_karigar/couponHistory', this.dbService.rootUrl).subscribe( r =>
        {
          console.log(r);
          if(r['coupon'] == '')
          { this.flag=1;}
          else
          {
            setTimeout(()=>{
              this.coupon_list=this.coupon_list.concat(r['coupon']);
              console.log('Asyn operation has stop')
              infiniteScroll.complete();
            },1000);
          }
        });
      }

      ionViewDidLeave()
      {
        if(this.dbService.connection!='offline')
        {
        let nav = this.app.getActiveNav();
        if(nav && nav.getActive())
        {
          let activeView = nav.getActive().name;
          let previuosView = '';
          if(nav.getPrevious() && nav.getPrevious().name)
          {
            previuosView = nav.getPrevious().name;
          }
          console.log(previuosView);
          console.log(activeView);
          console.log('its leaving');
          if((activeView == 'HomePage' || activeView == 'GiftListPage' || activeView == 'TransactionPage' || activeView == 'ProfilePage' ||activeView =='MainHomePage') && (previuosView != 'HomePage' && previuosView != 'GiftListPage'  && previuosView != 'TransactionPage' && previuosView != 'ProfilePage' && previuosView != 'MainHomePage'))
          {

            console.log(previuosView);
            this.navCtrl.popToRoot();
          }
        }
      }
    }
    balance_point:any=0;
    transaction_detail:any=[];
    getTransactionDetail()
    {
        this.filter.limit=0;
        this.dbService.onPostRequestDataFromApi({'karigar_id':this.dbService.userStorageData.id,'filter':this.filter},'app_karigar/transaction', this.dbService.rootUrl)
        .subscribe((r)=>
        {
            console.log(r);
            if(r)
            {
                this.loading.dismiss();
                this.transaction_detail=r['transaction']
                this.balance_point=parseInt(r['karigar'].balance_point) +parseInt(r['karigar'].reg_points) ;
            }
        });
    }
    change_tab(tab)
    {
        this.filter.active_tab = tab;
        if(this.filter.active_tab == "points")
        {
            this.getCoupanHistory();
        }

        if(this.filter.active_tab == "redeem")
        {
            this.getTransactionDetail();
        }

        if(this.filter.active_tab == "offer_list")
        {
            // this.getTransactionDetail();
             this.navCtrl.push(OffersPage,{'id':'3'});

        }
    }

}
