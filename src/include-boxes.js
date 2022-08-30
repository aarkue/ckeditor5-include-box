import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import {toWidget} from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import Command from '@ckeditor/ckeditor5-core/src/command';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import includeBoxIcon from '../theme/icons/includeBox.svg';
import '../theme/includeElement.css';

export default class IncludeBox extends Plugin {
	static get requires() {
		return [ IncludeBoxEditing, IncludeBoxUI ];
	}
}

class IncludeBoxUI extends Plugin {
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'includeElementBox', locale => {
			const command = editor.commands.get( 'insertIncludeElementBox' );
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Include element' ),
				icon: includeBoxIcon,
				tooltip: true
			} );

			buttonView.bind( 'isOn', 'isEnabled' ).to( command, 'value', 'isEnabled' );

			this.listenTo( buttonView, 'execute', () => editor.execute( 'insertIncludeElementBox' ) );

			return buttonView;
		} );
	}
}

class IncludeBoxEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'insertIncludeElementBox', new InsertIncludeElementCommand( this.editor ) );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		schema.register( 'includeElementBox', {
			isObject: true,
			allowAttributes: [ 'elementid', 'size' ],
			allowWhere: ['$root','$block','$text']
		} );
	}

	_defineConverters() {
		const editor = this.editor;
		const conversion = editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			model: ( viewElement, { writer: modelWriter } ) => {

				return modelWriter.createElement( 'includeElementBox', {
					elementid: viewElement.getAttribute( 'data-element-id' ),
					size: viewElement.getAttribute( 'data-size' ),
				} );
			},
			view: {
				name: 'section',
				classes: 'include-element'
			}
		} );
		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'includeElementBox',
			view: ( modelElement, { writer: viewWriter } ) => {
				return viewWriter.createContainerElement( 'section', {
					class: 'include-element',
					'data-element-id': modelElement.getAttribute( 'elementid' ),
					'data-size': modelElement.getAttribute( 'size' ),
				} );
			}
		} );
		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'includeElementBox',
			view: ( modelElement, { writer: viewWriter } ) => {

				const elementid = modelElement.getAttribute( 'elementid' );
				const size = modelElement.getAttribute( 'size' );

				const section = viewWriter.createContainerElement( 'section', {
					class: 'include-element box-' + size,
					'data-element-id': elementid,
					'data-size': size
				} );

				const includedELementWrapper = viewWriter.createUIElement( 'div', {
					class: 'include-element-wrapper'
				}, function( domDocument ) {
                    const domElement = this.toDomElement( domDocument );
                    domElement.innerHTML = editor.config.get('includeElement.initialHTML') || '<span>Loading content...</span>';
                    console.log(editor.config.get('includeElement.renderer'),editor.config.get('includeElement.test'))
                    if(editor.config.get('includeElement.renderer')){
                        editor.config.get('includeElement.renderer').render(elementid,size,domElement);
                    }
                    return domElement;
				} );
                console.log({includedELementWrapper})

				viewWriter.insert( viewWriter.createPositionAt( section, 0 ), includedELementWrapper );

				return toWidget( section, viewWriter, { label: 'Include element widget' } );
			}
		} );
	}
}

class InsertIncludeElementCommand extends Command {
	async execute() {
		const res = await this.editor.config.get('includeElement.renderer').presentSelector()
		if(!res){
			return;
		}
		const {id, size = 'full'} = res;
        this.editor.model.change( writer => {
            let elementid = id;
            this.editor.model.insertContent(writer.createElement('includeElementBox', {
                elementid: elementid,
                size: size
            }));
        } );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const allowedIn = model.schema.findAllowedParent( selection.getFirstPosition(), 'includeElementBox' );

		this.isEnabled = allowedIn !== null;
	}
}