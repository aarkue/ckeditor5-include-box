import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Autoformat from "@ckeditor/ckeditor5-autoformat/src/autoformat";
import blockAutoformatEditing from '@ckeditor/ckeditor5-autoformat/src/blockautoformatediting';

export default class IncludeBoxesAutoformat extends Plugin {
    static get requires() {
		return [ Autoformat ];
	}

    afterInit(){
        if(this.editor.commands.get('insertIncludeElementBox')){
            blockAutoformatEditing(this.editor,this,/^\!\[\[$/, 'insertIncludeElementBox')
        }
    }
}