# Card.js Documentation

## Overview
The `card.js` file is used for configuring the summary card view for a collection. It displays fields as defined in the corresponding `schema.json` file for that collection, allowing you to present key details (such as voucher, book, policy, event, asset class, portfolio, etc.) in a card format.

The `template` key is used to define the card template in `card.js`.

> **Note:** If a `card.js` file is present for a collection, the card layout will be available for access. If not, the standard framework list view will be used instead.

The typical location for a card.js file is:
```
<<APP NAME>>/rest/collection/<<Collection Name>>/card.js
```

The card.js file contains:
```javascript
capps.ui.<<collection_name>>.card = {
    template: `...`, // HTML template for the card
    style: `...`     // CSS styles for the card (optional)
}
```

## Features

### 1. Card Template
Defines the HTML structure for displaying record details in a card format. Uses mustache-style bindings (e.g., `{{ doc.FIELD_NAME }}`) to display data.

**Example:**
```javascript
capps.ui.accounting_entries_mast.card = {
    template: `
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
                        <div class="cont text-truncate"> {{ doc.BOOK }} </div>
                    </div>
                    <div class="content">
                        <div class="hd">POLICY</div>
                        <div class="cont text-truncate">{{ doc.POLICY }}</div>
                    </div>
                    <div class="content">
                        <div class="hd">EVENT NAME</div>
                        <div class="cont text-truncate">{{ doc.EVENT_NAME }}</div>
                    </div>
                    <div class="content">
                        <div class="hd">ASSET CLASS CODE</div>
                        <div class="cont text-truncate">{{ doc.ASSET_CLASS_CODE }}</div>
                    </div>
                    <div class="content">
                        <div class="hd">PORTCODE</div>
                        <div class="cont text-truncate">{{ doc.PORTCODE }}</div>
                    </div>
                    <div class="content">
                        <div class="hd">PORTFOLIO</div>
                        <div class="cont text-truncate">{{ doc.PORTFOLIO }}</div>
                    </div>
                </div>
            </div>
        </div>
    `,
}
```

### 2. Data Binding
The template uses the `doc` object to bind and display field values. All placeholders like `{{ doc.FIELD_NAME }}` are dynamically replaced with the corresponding values from the record.

> **Note:** The `doc` object contains the current row's data. Each time a card is rendered, `doc` will have the data for that specific record.

### 3. Card Styling
The framework supports custom CSS styling through the `style` property. This allows you to define custom styles that will be applied to your card template.

**Important:** Do NOT include `<style>` tags within the template HTML. Use the separate `style` property instead.

**Example with Custom Styles:**
```javascript
capps.ui.investments.card = {
    template: `
        <div class="investment-card">
            <div class="card-header">
                <h4>{{ doc.INVESTMENT_NAME }}</h4>
                <div class="status-badge">{{ doc.STATUS }}</div>
            </div>
            <div class="card-body">
                <div class="investment-details">
                    <div class="detail-item">
                        <span class="label">Amount:</span>
                        <span class="value">{{ doc.AMOUNT }}</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Type:</span>
                        <span class="value">{{ doc.INVESTMENT_TYPE }}</span>
                    </div>
                </div>
            </div>
        </div>
    `,
    style: `
        .investment-card {
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            transition: box-shadow 0.3s ease;
        }
        .investment-card:hover {
            box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }
        .card-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .status-badge {
            background: rgba(255,255,255,0.2);
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 12px;
        }
        .investment-details {
            padding: 15px;
        }
        .detail-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
        }
        .label {
            font-weight: bold;
            color: #666;
        }
        .value {
            color: #333;
        }
    `
}
```

### 4. Styling Options
You have several options for styling your cards:

1. **Custom CSS (Recommended)**: Use the `style` property for component-specific styles
2. **Inline Styles**: Add `style` attributes directly in the HTML template
3. **Bootstrap Classes**: Use Bootstrap classes since CAPPS includes Bootstrap
4. **Global CSS**: Define styles in your application's global CSS files

### 5. Customization
You can customize the card layout, add or remove fields, and style the card as needed by editing the HTML template string and adding custom CSS through the `style` property.

## Usage

- The card component is dynamically loaded by the capps framework.
- It is typically used to show a summary view for a record in a collection.
- The template is injected and rendered using the framework's dynamic component loader.

**Integration Example:**
```javascript
// This card will be loaded for the accounting_entries_mast collection
capps.ui.accounting_entries_mast.card = {
    template: `...`, // See above for full template
}
```

## Complete Example with Both Template and Style
```javascript
capps.ui.accounting_entries_mast.card = {
    template: `
        <div class="custom-accounting-card">
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
                        <div class="cont text-truncate"> {{ doc.BOOK }} </div>
                    </div>
                    <div class="content">
                        <div class="hd">POLICY</div>
                        <div class="cont text-truncate">{{ doc.POLICY }}</div>
                    </div>
                    <div class="content">
                        <div class="hd">EVENT NAME</div>
                        <div class="cont text-truncate">{{ doc.EVENT_NAME }}</div>
                    </div>
                    <div class="content">
                        <div class="hd">ASSET CLASS CODE</div>
                        <div class="cont text-truncate">{{ doc.ASSET_CLASS_CODE }}</div>
                    </div>
                    <div class="content">
                        <div class="hd">PORTCODE</div>
                        <div class="cont text-truncate">{{ doc.PORTCODE }}</div>
                    </div>
                    <div class="content">
                        <div class="hd">PORTFOLIO</div>
                        <div class="cont text-truncate">{{ doc.PORTFOLIO }}</div>
                    </div>
                </div>
            </div>
        </div>
    `,
    style: `
        .custom-accounting-card {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .custom-accounting-card .card-header {
            background: linear-gradient(45deg, #007bff, #0056b3);
            border-bottom: none;
        }
        .custom-accounting-card .grid--3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }
        .custom-accounting-card .content {
            background: white;
            padding: 10px;
            border-radius: 5px;
            border-left: 3px solid #007bff;
        }
        .custom-accounting-card .hd {
            font-weight: bold;
            color: #495057;
            font-size: 12px;
            text-transform: uppercase;
        }
        .custom-accounting-card .cont {
            color: #212529;
            margin-top: 5px;
        }
    `
}
```

---
[Go back to main page](../README.md)