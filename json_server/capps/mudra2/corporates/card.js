module.exports = `capps.ui.corporates.card = {
    template: \` 
    <div class="card">
        <div class="card-header">
            <div>
                <h4 class="text-capitalize">{{ doc.VOUCHER_NAME }} {{ doc.VOUCHER_NO ? '- ' + doc.VOUCHER_NO : '' }}</h4>
                <div class="icon_wrap date" style="grid-template-columns: 1fr;"><span>{{doc.VALUEDATE}}</span></div>
            </div>
            <div class="text-truncate">
                <div class="text-right badge badge-info badge-pill text-truncate" style="max-width: 130px" ><span style="color: white;">{{ doc.DEAL_NO }}</span></div>
            </div>
        </div>
        <div class="card-body">
            <div class="card-content grid--3">
                <div class="content">
                    <div class="hd">BOOK</div>
                    <div title="4567" class="cont text-truncate"> {{ doc.BOOK }} </div>
                </div>
                <div class="content">
                    <div class="hd">POLICY</div>
                    <div title="456789" class="cont text-truncate">{{ doc.POLICY }}</div>
                </div>
                <div class="content">
                    <div class="hd">EVENT NAME</div>
                    <div title="CHEQUE" class="cont text-truncate">{{ doc.EVENT_NAME }}</div>
                </div>

                <div class="content">
                    <div class="hd">ASSET CLASS CODE</div>
                    <div title="CHEQUE" class="cont text-truncate">{{ doc.ASSET_CLASS_CODE }}</div>
                </div>

                <div class="content">
                    <div class="hd">PORTCODE</div>
                    <div title="CHEQUE" class="cont text-truncate">{{ doc.PORTCODE }}</div>
                </div>

                <div class="content">
                    <div class="hd">PORTFOLIO</div>
                    <div title="CHEQUE" class="cont text-truncate">{{ doc.PORTFOLIO }}</div>
                </div>
            </div>
        </div>
    </div>\`
    ,
}`