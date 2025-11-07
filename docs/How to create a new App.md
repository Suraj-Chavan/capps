# 🚀 Quick Guide to Creating a New App using CAPPs

## 📌 Dependencies  
- CAPPs  

## ⚡ Quick App Creation  
Let’s create an app named **`my_awesome_app`** 🎉  

### 📂 Folder Structure  
Create the following folder structure inside the `credence/apps/` directory:  

```plaintext
.
└── credence/
    └── apps/
        └── my_awesome_app/
            ├── rest/
            │   └── collection
            ├── event-hooks
            ├── pages
            ├── plugins
            ├── en.json
            └── config.json
```

### 🌍 Set Up Language File  
Create **`en.json`** with the following content:  

```json
{ "my_awesome_app": {} }
```

### ⚙️ Configure the App  
Create **`config.json`** with the following content:  

```json
{ "NAME": "My Awesome App", "DEFAULT_VIEW": "" }
```

<div style="page-break-after: always;"></div>

### ⚙️ Create a Worklflow Page
Create a workflow page named `awesome_dashboard` using page builder. 
Move the `NREST/pages/awesome_dashboard` folder to `my_awesome_app/pages`. 

Fire the following query to update the path of this page
```sql
update ab_pages set path ='my_awesome_app' where pageid='awesome_dashboard'
```
**Note:This update is required to edit this page using pagebuilder**

### ✏️ Integrate App into Core Product  
If your product framework supports app definitions, add a record to `iwz_app_defin` with the route set as `/capps/dist/index.html#/my_awesome_app/pages/awesome_dashboard`. Then, assign the app to the appropriate role using the app management feature.


## 🔗 Access Your App  
Your awesome app is now available at:  
👉 `https://<webserver ip>/capps/dist/index.html#/my_awesome_app/pages/awesome_dashboard`

---

<div style="page-break-after: always;"></div>

## 📜 Define a New Collection  

### ✏️ Design the Schema  
As a best practice, use 🔗 [Schema Design Sheet](https://docs.google.com/spreadsheets/d/1-WSgp326xEQUHYCLh24LPfXuoGsIzsaIpxrwzqUdhSQ/edit?usp=sharing)
 to design your schema: 
### 🏗️ Create Your First Collection  
Let’s create a schema named **`family`** following the designed schema.

📁 Folder Structure:  
```plaintext
.
└── credence/
    └── apps/
        └── my_awesome_app/
            ├── rest/
            │   └── collection/
            │       └── family/
            │           └── schema.json
            ├── event-hooks
            ├── pages
            ├── plugins
            ├── en.json
            └── config.json
```

📜 **Add the following content to `schema.json`**  
```json
{
    "DATA_MODEL": "AW_FAMILY",
    "NAME": "FAMILY",
    "DEFAULT_VIEW": "list",
    "ACTIONS": [ "CREATE", "UPDATE", "DELETE", "EXPORT" ], 
    "SORT_FIELD": "FAMILY_NAME",
    "SORT_ORDER": "DESC",
    "FIELDS": {
        "ID": {
            "fieldtype": "float",
            "iskey": 1
        },
        "FAMILY_NAME": {
            "fieldtype": "textfield",
            "maxlength": 250,
            "required": 1
        }
    }
}
```

### 📖 Schema Attributes Details -  [🔗](https://docs.google.com/spreadsheets/d/1-WSgp326xEQUHYCLh24LPfXuoGsIzsaIpxrwzqUdhSQ/edit?usp=sharing)

| Attribute | Description | Default | Mandatory | Data Type | Allowed Values |
|---|---|---|---|---|---|
| DATA_MODEL | The name of the data model table |  | Yes | String |  |
| NAME | The collection label name to be displayed in frontend |  | No | String |  |
| DEFAULT_VIEW | Default view layout for the collection.Currently list is only supported | list | Yes | String | list |
| ACTIONS | A list of supported actions against the collection | [] | No | Array | ["CREATE", "UPDATE", "DELETE", "EXPORT"] |
| FIELDS | List of schema fields with their configuration<br>Field attribute list and description are mentioned below | {} | Yes | Object |  |
| MODAL_SIZE | Child collection  form size | md | No | String | xl, sm, lg, md |
| SORT_FIELD | Collection field name on which data will be sorted by default |  | No | String |  |
| SORT_ORDER | Determines the order in which data is arranged | ASC | No | String | ASC, DESC |
| RESTRICT_API | A list of operations which are restricted  | [] | No | Array | ["CREATE", "UPDATE", "DELETE", "EXPORT"] |
| VIRTUAL_COLLECTION | A custom query-based collection that is not part of the capps framework  | 0 | No | Number | 0, 1 |
| SQL | A select query with all required columns for virtual collection  |  | YES if collection is virtual | String | Oracle select query |


### 🔢 Field Attributes Details - [🔗](https://docs.google.com/spreadsheets/d/1-WSgp326xEQUHYCLh24LPfXuoGsIzsaIpxrwzqUdhSQ/edit?usp=sharing)

| Attribute | Description | Default | Mandatory | Applicable For Field Type | Allowed Values |
|---|---|---|---|---|---|
| fieldtype | Form input control type |  | Yes |  | button, textfield, checkbox, radio, switch, textarea, int, float, email_address, date, time, datetime, select, table, Section Break, Column Break |
| readonly | Prevents user edit. <br>Any attempts to update this field later will be ignored<br>It is primarily used for system-generated fields like created_on,created_by etc | 0 | No | All | 0, 1 |
| iskey | Indicates that the field is a primary key . <br>It will be deprecated in future , as ID field will be considered as primary key | 0 | No | ID | 0, 1 |
| disabled | Disables the field on the UI , making it non-editable | 0 | No | All | 0, 1 |
| restrict_update | Not allowed to edit during update operation. <br>Even if data is sent in api , it will be ignored | 0 | No | All | 0, 1 |
| maxlength | Limits the number of characters a user can enter in the input field. |  | No | All | Any positive integer |
| required | Indicates if the field is mandatory or not <br> | 0 | No | All | 0, 1<br>0 - Not mandatory <br>1 - Mandatory |
| hidden | The field will not be displayed on the screen. | 0 | No | All | 0, 1 |
| default | Its value will be pre-filled on the collection form screen.<br>In the API, if no value is provided for the field, it will default to the value specified in this attribute. |  | No | All | Any string and predefined constants <br>Predefined Constants<br>CURRENT_DATE -  Current date value <br>CURRENT_TIMESTAMP - Current date time value<br>LOGGED_IN_USER - Logged in users userid  |
| in_standard_filter | If this attribute is set to 1, users will be able to filter records by this field in the grid view. | 0 | No | All | 0, 1 |
| in_list_view | It indicates whether the field should be displayed in the collection's main grid | 1 | No | All | 0, 1 |
| unique | If this attribute is set to 1, the collection’s create API enforces uniqueness for this field, preventing the creation of new records with a duplicate value in the table | 0 | No | All | 0, 1 |
| checked-value | Specifies the field’s value when the checkbox or switch is selected (checked). | YES | No | checkbox,radio | Any string |
| unchecked-value | Specifies the field’s value when the checkbox or switch is deselected (unchecked). | NO | No | checkbox,radio | Any string |
| rows | Specifies how many text lines are to be visible in a textarea. | 1 | No | textarea | Any positive integer |
| max-rows | Sets the maximum number of lines that can be displayed/entered in a textarea. | 1 | No | textarea | Any positive integer |
| disable_future_dates | Prevents users from choosing any date beyond the current date. | 0 | No | date, datetime | 0, 1 |
| disable_past_dates | Prevents users from choosing any date earlier than the current date. | 0 | No | date, datetime | 0, 1 |
| multiple | Enables users to select more than one option for this field. | 0 | No | select | 0, 1 |
| enum | Specifies a predefined list of acceptable values for the field. | [] | No | select | Any list of strings |
| linked_to | This attribute is used for foreign key relationship. <br>It contains set of attributes to be set if the field is to be linked to parent collection<br> | null | No | select | Following is the object to set . Check the description for the attributes<br>{<br> ""ref"":"""",<br> ""filter"":"""",<br>""display_name"":"""",<br>""key"":""" |
| }" |  |  |  |  |  |
| linked_to.ref | Specifies the collection name refreced to. It should b Collection folder name  | null | No | select | A collection name |
| linked_to.filter | Adds a filter condition to limit or refine records from the linked collection. | null | No | select | An array list of filter expressions |
| linked_to.key | Specifies the primary key from referenced the linked collection | null | No | select | Key field from refrenced collection |
| linked_to.display_name | Determines which field is shown as the display name form the refrenced collection | null | No | select | Field name from refrenced collection |
| label | The caption or title used to label the field in the UI. | Collection fieldname | No | All | Any string |
| grid_column_size | Total number of columns to be shown in form for particular row. To change column grid size of row, add this attribute to first field of next rows | 4 | No | All | 1, 2, 3, 4 |
| ref | Linked child collection name  | null | Yes | table | collection name |
| is_amount |	If the number field type should be formatted as per currency format |	0 |	No	| number, float, int  |	0, 1 |
| expression_builder | "This attribute converts the text area in to a expression builder where it allows user to select values from suggestions attribute. The autocomplete is triggered on input of curly brace `{`" |	0	| No	| textarea	| 0, 1 |
| suggestions  | An array list with all string values which to be displayed for suggesion in expression	 |	Yes, if expression builder is enabled	| textarea	| [] | 
| dont_copy_on_duplicate |	|	null	| No	| All except table fieldtype | 	1, 0 |
| sub_labels	| An string with field dynamic expresion `{FIELDNAME 1} {FIELDNAME 2}` this text will be shown on your remote select option as sub label 	| |		select fieldtype with linked_to is added  | |	
| command_palette	| "This attribute converts the text area in to a command palette where it allows user to select values from commands attribute. The autocomplete is triggered on input of forward slash `/`"	| 0 | 	No | 	textarea	| 0, 1 |
| commands	| "An array of Object with following supported keys - value - name - category -desc"	| []	| Yes, if command_palette is enabled	| textarea	| [] |
| in_quick_filter	|	The field will be shown on above grid as Quick filter section | 0 | 	No	| All	| 0, 1 |
| list_column_size	|	Will be used to set a custom width to a column in list grid view | different for different field types | 	No	| All	| Any positive integer |

<div style="page-break-after: always;"></div>

### 🔢 Field Type Details -  [🔗](https://docs.google.com/spreadsheets/d/1-WSgp326xEQUHYCLh24LPfXuoGsIzsaIpxrwzqUdhSQ/edit?usp=sharing)

| Field Type | Description | Database Field Types |
|---|---|---|
| button | A button within the collection form | N/A |
| textfield | A string input | VARCHAR2 |
| checkbox | A checkbox input field with two possible values: checked state value and unchecked state value | VARCHAR2 |
| radio | A collection of multiple radio inputs with the same name but different values | VARCHAR2 |
| switch | A checkbox input field that looks like a switch | VARCHAR2 |
| textarea | A long text input field | VARCHAR2 |
| int | An input field that only allows integer numbers | NUMBER |
| float | An input field that allows decimal numbers | NUMBER |
| email_address | An input field that only allows email input | VARCHAR2 |
| date | A date input control | DATE |
| time | A time input control | DATE |
| datetime | An input field that allows selecting date and time | DATE |
| select | A dropdown input control | VARCHAR2 |
| table | A field type that allows adding a child collection to the current collection | N/A |
| Section Break | A field type that creates a section within the form | N/A |
| Column Break | A field type that moves the next columns to a new line | N/A |
| file |	Field type that allows to select binary file | 	BLOB |
| password |	A password field	| VARCHAR2 |
| ratings |	The rating field where user can select ratings from a range |	NUMBER |
| hyperlink |	A clickable link |	N/A |
| rich_text_editor |	A rich text editor WYSIWYG |	VARCHAR2 |


<div style="page-break-after: always;"></div>

### 🎨 Optional: Update **`en.json`** for Labels  
```json
{
    "my_awesome_app": {
        "family": {
            "headings": {},
            "fields": {
                "FAMILY_NAME": "Family Name"
            },
            "actions": {
                "CREATE": "Add"
            }
        }
    }
}
```

## 🔄 Restart & Access the Collection  
Since a new collection was added, **restart the REST server** 🔄  

Your new collection view is automatically created and accessible at:  
👉 `https://<webserver ip>/capps/dist/index.html#/my_awesome_app/doc/family/view/list`

🚀 **Your app is now ready to go!** 🎉


## Further Reading

- [How to Add User Defined Actions](./CAPPS%20APIS.md#capps-apis) ?
- [Detailed explanation of the UI API](./#%20CAPPS%20UI%20Framework.md) 
- [Detailed explanation of the LIST API](./CAPPS%20UI%20LIST%20JS.md)
- [Detailed explanation of the FORM API](./CAPPS%20UI%20FORM%20JS.md)
- [Detailed explanation of the CARD API](./CAPPS%20UI%20CARD%20JS.md)
- [CAPPs Layout Documentation](./capps%20layout%20documentation.md#layout-structure)
- [CAPPs Custom Form Documentation](./capps_custom_add_modify_screen.md#virtual-collection-custom-addmodify-screen)

---
[Go back to main page](../README.md)