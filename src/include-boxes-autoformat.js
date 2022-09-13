import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat";
import blockAutoformatEditing from '@ckeditor/ckeditor5-autoformat/src/blockautoformatediting';
import inlineAutoformatEditing from '@ckeditor/ckeditor5-autoformat/src/inlineautoformatediting';

export default class IncludeBoxesAutoformat extends Plugin {
    static get requires() {
		return [ Autoformat ];
	}

    afterInit(){
        if(this.editor.commands.get('insertIncludeElementBox')){
            // blockAutoformatEditing(this.editor,this,/^\!\[\[$/, 'insertIncludeElementBox')
            inlineAutoformatEditing(this.editor,this,/(?:^|\s)(\!\[)(\[*)(\[)$/g, ( writer, rangesToFormat ) => {
            console.log({rangesToFormat,writer})
            this.editor.execute('insertIncludeElementBox');
        })
            
        }
    }
}