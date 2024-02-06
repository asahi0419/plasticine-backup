export default {
  name: 'Tutorial page',
  alias: 'tutorial',
  server_script: `
const { find, map, reduce, filter, each, pick, has, sortBy, orderBy } = lodash;
const request = p.getRequest();
//p.log.info("request >>>  " +  JSON.stringify(request) );

try {
  const tutorialModel = await p.getModel('tutorial');
  const articleModel = await p.getModel('tutorial_article');
  const {tutorialPermalink, articlePermalink } = request;

  if (tutorialPermalink){
    const tutorial = await tutorialModel.findOne({ permalink: tutorialPermalink }).raw();
    const currentTutorialId = lodash.has(tutorial, 'id') ? tutorial.id : 0;

    let currentArticleId = 0;

    if(articlePermalink){
      const article = await articleModel.findOne({ tutorial:currentTutorialId, permalink : articlePermalink  }).raw();
      currentArticleId = lodash.has(tutorial, 'id') ? (lodash.has(article, 'id') ? article.id : 0 ): 0;
    }

    let articles = await p.iterMap(articleModel.find({ tutorial: currentTutorialId}).raw());
    articles = await Promise.all(articles.map(async (item) => {
              const access = {accesseble : await p.checkAccess(articleModel, item)};
              return {...item, ...access};
    }));
    lodash.remove(articles, article => article.accesseble === false);

    const preOrderArticles = lodash.orderBy(articles, [x => x.order, y => y.name], ['desc','asc']);
    const sortedArticles = lodash.orderBy(preOrderArticles, [x => x.order, y => y.name.toLowerCase()], ['desc','asc']);


    let data = [];
    if(lodash.has(tutorial, 'id')){
        const access = await p.checkAccess(tutorialModel, tutorial);
        if(access){
           data.push({tutorial, articles : sortedArticles});
        }
    }

    if(!articlePermalink){
        currentArticleId = sortedArticles.length > 0 ? sortedArticles[0].id : 0;
    }

    let context = {data, currentTutorialId,  currentArticleId}
    p.response.json({ context : context});
    return;
  }
  // tutorialId
  if(request.tid){
     const tutorial = await tutorialModel.findOne({ id: request.tid }).raw();
     let articles = await p.iterMap(articleModel.find({ tutorial: request.tid }).raw());
     articles = await Promise.all(articles.map(async (item) => {
              const access = {accesseble : await p.checkAccess(articleModel, item)};
              return {...item, ...access};
     }));
     lodash.remove(articles, article => article.accesseble === false);
     const preOrderArticles = lodash.orderBy(articles, [x => x.order, y => y.name], ['desc','asc']);
     const sortedArticles = lodash.orderBy(preOrderArticles, [x => x.order, y => y.name.toLowerCase()], ['desc','asc']);

     const currentTutorialId = lodash.has(tutorial, 'id') ? tutorial.id : 0;
     const currentArticleId = sortedArticles.length > 0 ? sortedArticles[0].id : 0;

     let data = [];
     if(lodash.has(tutorial, 'id')){
        data.push({tutorial, articles : sortedArticles});
     }

     let context = {data, currentTutorialId,  currentArticleId}
     p.response.json({ context : context});
     //p.log.info("tid " +  JSON.stringify(context) );
     return;
  }

  // articleId
  if(request.article_id){
     const article = await articleModel.findOne({ id: request.article_id }).raw();
     let articles = [];
     if (lodash.has(article, 'id')){
        articles.push(article);
     }
     articles = await Promise.all(articles.map(async (item) => {
              const access = {accesseble : await p.checkAccess(articleModel, item)};
              return {...item, ...access};
     }));
     lodash.remove(articles, article => article.accesseble === false);
     const preOrderArticles = lodash.orderBy(articles, [x => x.order, y => y.name], ['desc','asc']);
     const sortedArticles = lodash.orderBy(preOrderArticles, [x => x.order, y => y.name.toLowerCase()], ['desc','asc']);

     const tutorial = lodash.has(article, 'tutorial') ? await tutorialModel.findOne({ id: article.tutorial }).raw() : {};
     const currentTutorialId = lodash.has(tutorial, 'id') ? tutorial.id : 0;
     const currentArticleId = sortedArticles.length > 0 ? sortedArticles[0].id : 0;

     let data = [];
     if(lodash.has(tutorial, 'id')){
        data.push({tutorial, articles : sortedArticles});
     }

     let context = {data, currentTutorialId,  currentArticleId}
     p.response.json({ context : context});

     //p.log.info("aid " +  JSON.stringify(context) );
     return;
  }

  let data = [];
  let tutorials = await p.iterMap(tutorialModel.find().raw());
  tutorials = await Promise.all(tutorials.map(async (t) => {
    const access = {accesseble : await p.checkAccess(tutorialModel, t)};
    return {...t, ...access};
  }));
  lodash.remove(tutorials, tutorial => tutorial.accesseble === false);

  const sortedTutorials = lodash.sortBy(tutorials, ['name']);
  const currentTutorialId = sortedTutorials.length > 0 ? sortedTutorials[0].id : 0;

  await Promise.all(tutorials.map(async (tutorial) => {
     let articles = await p.iterMap(articleModel.find({ tutorial: tutorial.id }).raw());
     articles = await Promise.all(articles.map(async (item) => {
              const access = {accesseble : await p.checkAccess(articleModel, item)};
              return {...item, ...access};
     }));
     lodash.remove(articles, article => article.accesseble === false);
     const preOrderArticles = lodash.orderBy(articles, [x => x.order, y => y.name], ['desc','asc']);
     const sortedArticles = lodash.orderBy(preOrderArticles, [x => x.order, y => y.name.toLowerCase()], ['desc','asc']);
     data.push({tutorial, articles : sortedArticles});
  }));

  const preSortedDataByTutorials = lodash.orderBy(data, item => item.tutorial.name, ['asc']);
  const sortedDataByTutorials = lodash.orderBy(preSortedDataByTutorials, item => item.tutorial.name.toLowerCase(), ['asc']);

  const currentArticleId = sortedDataByTutorials.length > 0 ? (sortedDataByTutorials[0].articles.length > 0 ? sortedDataByTutorials[0].articles[0].id : 0 )  : 0;

  //p.log.info(JSON.stringify({context : { sortedDataByTutorials, currentTutorialId,  currentArticleId}}));

  p.response.json({context : { data:sortedDataByTutorials, currentTutorialId,  currentArticleId}});

} catch (error) {
  p.response.error(error);
}`,
  component_script: `{
  initState: (initial = true) => {
    const { data, currentTutorialId: tId, currentArticleId: aId } = p.getVariable('context');

    const selectedData = lodash.find(data, { tutorial: { id: tId } }) || {};
    const selectedTutorial = selectedData.tutorial || {};
    const selectedArticle = lodash.find(selectedData.articles, { id: aId }) || {};
    const content = selectedArticle.content || page.getArticleNotFount();
    const articles = page.getArticles((selectedData.articles || []), aId);
    const tutorials = page.getTutorials(data, tId);
    const value = lodash.isEmpty(selectedTutorial) ? 'Tutorial not found_0' : \`\${selectedTutorial.name}_\${selectedTutorial.id}\`;

    return { aId, tId, tutorials, articles, content, value, data };
  },

  getTutorials: (data = [], tId) => {
    const result = data.map((item) => {
      return {
        key: item.tutorial.id,
        text: item.tutorial.name,
        value: item.tutorial.name + '_' + item.tutorial.id,
        active: item.tutorial.id === tId ? true : false
      }
    });

    if (!result.length) {
      result.push({ key: 0, text: 'Tutorial not found', value: 'Tutorial not found_0' })
    }

    return result;
  },

  getArticles: (articles, aId, hId) => {
    let result = [];

    for (let article of articles) {
      const key = article.id + '_null';
      result.push({
        icon: article.id === aId ? 'down triangle' : null,
        active: article.id === aId ? true : null,
        content: article.name,
        key: key,
        onClick: e => page.handleClickList(article, key),
      });
      if (aId === article.id) {
        const headers = page.getHeaderInfo(article, hId);
        headers.forEach(item => { result.push(item) });
      }
    }

    return result;
  },

  getArticleNotFount: () => {
    const message = p.translate('article_not_found', {defaultValue: 'Article not found'});
    return page.getEditorJsText(message);
  },

  getHeaderInfo: (article, hId) => {
    const jsonContent = JSON.parse(article.content);
    if(!lodash.has(jsonContent, 'blocks'))
       return [];
    const headers = lodash.filter(jsonContent.blocks, {type: 'header'});
    const cssTabs = ['tutorial-list-item-tab-h1', 'tutorial-list-item-tab-h2', 'tutorial-list-item-tab-h3',
                     'tutorial-list-item-tab-h4', 'tutorial-list-item-tab-h5', 'tutorial-list-item-tab-h6'];
    return headers.map((header, index) => {
      const key = article.id + '_' + index;
      const cssTab = cssTabs[header.data.level - 1];
      return {
        content: header.data.text.substring(0, 10),
        className : cssTab,
        icon: hId === index ? 'right triangle' : null,
        key: key,
        onClick: e => page.handleClickList(article, key),
      }
    });
  },


  getEditorJsText: (content) => {
    const text = '{"time":1619614743073,"blocks":[{"type":"paragraph","data":{"text":"';
    return text + content + '"}}],"version":"2.20.2"}';
  },

  handleChangeDropdown: (e, { value }) => {
    const tId = Number.parseInt(value.split('_').pop());

    if (tId != page.state.tId) {
      const selectedData = tId > 0 ? lodash.find(page.state.data, { tutorial: { id: tId } }) : {};
      const aId = selectedData.articles.length > 0 ? selectedData.articles[0].id : 0;
      const articles = aId > 0 ? page.getArticles(selectedData.articles, aId) : [];
      const selectedArticle = aId > 0 ? lodash.find(selectedData.articles, {id: aId}) : {};
      const content = aId > 0 ? selectedArticle.content : page.getArticleNotFount();

      page.setState({ tId, aId, articles, value, content });
    }
  },

  handleClickList: (article, key) => {
    const selectedData = lodash.find(page.state.data, { tutorial: { id: article.tutorial } });
    const aId = article.id;
    const hId = Number.parseInt(key.split('_').pop());
    const articles = page.getArticles(selectedData.articles, aId, hId);
    const selectedArticle = aId > 0 ? lodash.find(selectedData.articles, { id: aId }) : {};
    const content = aId > 0 ? selectedArticle.content : page.getArticleNotFount();

    page.setState({ content, articles, aId });
  },

  renderEditorJs: () => {
    return (
      <CustomEditorJS
        disabled={true}
        value={page.state.content}
        enableReInitialize={true}
      />
    );
  },

  renderSearch: () => {
    return (
      <Input
        disabled
        icon='search'
        placeholder='Search...(inactive PH2)'
        className="tutorial-search"
      />
    );
  },

  renderDropdown: () => {
    return (
      <Dropdown
        search
        selection
        placeholder='Article'
        direction='right'
        options={page.state.tutorials}
        value={page.state.value}
        onChange={page.handleChangeDropdown}
        className="tutorial-dropdown"
      />
    );
  },

  renderList: () => {
    return (
      <div className="tutorial-articles">
        <List
          selection
          items={page.state.articles}
          onChange={page.handleClickList}
        />
      </div>
    );
  }
}`,

  styles: `.tutorial {
  display: flex;
  height: 100vh;
}

.tutorial-sidebar {
  display: flex !important;
  width: 250px !important;
  height: 100%;
  margin: 0;
  padding: 10px;
  box-shadow: none !important;
  border: none;
}

.tutorial-dropdown {
  margin: 10px 0;
  width: 100% !important;
}

.tutorial-articles {
  flex: 1;
  overflow-y: auto;
  border: 1px solid {mainBorder};
  border-radius: 5px;
}

.tutorial-content {
  flex: 1;
  padding: 10px 10px 10px 0;

  .editor-js,
  .editor-js-wrapper {
    height: 100% !important;
    opacity: 1 !important;
  }
}

.tutorial-list-item-tab-h1 {
  margin-left: 3px;
}

.tutorial-list-item-tab-h2 {
  margin-left: 6px;
}

.tutorial-list-item-tab-h3 {
  margin-left: 9px;
}

.tutorial-list-item-tab-h4 {
  margin-left: 12px;
}

.tutorial-list-item-tab-h5 {
  margin-left: 15px;
}

.tutorial-list-item-tab-h6 {
  margin-left: 18px;
}`,
  template: `<div className="tutorial">
  <Menu className="tutorial-sidebar" vertical>
    {page.renderSearch()}
    {page.renderDropdown()}
    {page.renderList()}
  </Menu>

  <div className="tutorial-content">
    {page.renderEditorJs()}
  </div>
</div>`,
  access_script: '!p.currentUser.isGuest()',
  __lock: ['delete'],
};
